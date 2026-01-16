import { API_BASE_URL } from './api';
import type {
    QueryRequest,
    StreamStatusEvent,
    SourceChunk,
    StreamAnswerEvent,
    StreamCompleteEvent,
    StreamErrorEvent,
} from '../types';

export interface StreamCallbacks {
    onStatus: (data: StreamStatusEvent) => void;
    onSource: (data: SourceChunk) => void;
    onAnswer: (data: StreamAnswerEvent) => void;
    onComplete: (data: StreamCompleteEvent) => void;
    onError: (data: StreamErrorEvent) => void;
}

export async function streamQuery(
    request: QueryRequest,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/query/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentEventType: string | null = null;

    try {
        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                const trimmedLine = line.trim();

                if (trimmedLine === '') {
                    continue;
                }

                if (trimmedLine.startsWith('event: ')) {
                    currentEventType = trimmedLine.slice(7).trim();
                } else if (trimmedLine.startsWith('data: ')) {
                    const dataStr = trimmedLine.slice(6);

                    if (!currentEventType) {
                        continue;
                    }

                    try {
                        const data = JSON.parse(dataStr);

                        switch (currentEventType) {
                            case 'status':
                                callbacks.onStatus(data as StreamStatusEvent);
                                break;
                            case 'source':
                                callbacks.onSource(data as SourceChunk);
                                break;
                            case 'answer':
                                callbacks.onAnswer(data as StreamAnswerEvent);
                                break;
                            case 'complete':
                                callbacks.onComplete(data as StreamCompleteEvent);
                                break;
                            case 'error':
                                callbacks.onError(data as StreamErrorEvent);
                                break;
                        }
                    } catch (parseError) {
                        console.error('Failed to parse SSE data:', parseError, dataStr);
                    }

                    currentEventType = null; // Reset for next event
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

// Hook for easier React integration
export function createStreamingQueryController() {
    let abortController: AbortController | null = null;

    return {
        execute: async (request: QueryRequest, callbacks: StreamCallbacks) => {
            // Cancel any existing request
            if (abortController) {
                abortController.abort();
            }

            abortController = new AbortController();

            try {
                await streamQuery(request, callbacks, abortController.signal);
            } catch (error) {
                if ((error as Error).name === 'AbortError') {
                    console.log('Query cancelled');
                    return;
                }
                throw error;
            }
        },

        cancel: () => {
            if (abortController) {
                abortController.abort();
                abortController = null;
            }
        },
    };
}
