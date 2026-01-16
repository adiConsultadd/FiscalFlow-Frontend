import { useCallback, useRef } from 'react';
import { useQueryStore } from '../store/queryStore';
import { createStreamingQueryController } from '../services/queryService';
import type { QueryHistoryItem, SourceChunk } from '../types';

export function useStreamingQuery() {
    const {
        isStreaming,
        currentStage,
        stageMessage,
        targetYears,
        sources,
        answer,
        error,
        traversalLog,
        setStreaming,
        setStage,
        setTargetYears,
        addSource,
        setAnswer,
        setError,
        setTraversalLog,
        reset,
        addToHistory,
    } = useQueryStore();

    const controllerRef = useRef(createStreamingQueryController());
    const queryRef = useRef<{ query: string; company_ticker?: string } | null>(null);

    const executeQuery = useCallback(async (
        username: string,
        query: string,
        companyTicker?: string
    ) => {
        // Reset state
        reset();
        setStreaming(true);
        queryRef.current = { query, company_ticker: companyTicker };

        let collectedAnswer = '';
        let collectedYears: string[] = [];
        const collectedSources: SourceChunk[] = [];

        try {
            await controllerRef.current.execute(
                { username, query, company_ticker: companyTicker },
                {
                    onStatus: (data) => {
                        setStage(data.stage, data.message);
                        if (data.target_years) {
                            setTargetYears(data.target_years);
                            collectedYears = data.target_years;
                        }
                    },
                    onSource: (data) => {
                        addSource(data);
                        collectedSources.push(data);
                    },
                    onAnswer: (data) => {
                        setAnswer(data.content);
                        collectedAnswer = data.content;
                    },
                    onComplete: (data) => {
                        setTraversalLog(data.traversal_log);
                        setStage('complete', 'Analysis complete');
                        setStreaming(false);

                        // Save to history
                        const historyItem: QueryHistoryItem = {
                            id: crypto.randomUUID(),
                            query: queryRef.current?.query || query,
                            company_ticker: queryRef.current?.company_ticker,
                            answer: collectedAnswer,
                            sources: collectedSources,
                            target_years: collectedYears,
                            timestamp: new Date().toISOString(),
                        };
                        addToHistory(historyItem);
                    },
                    onError: (data) => {
                        setError(data.message);
                        setStage(data.stage as Parameters<typeof setStage>[0], data.message);
                        setStreaming(false);
                    },
                }
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            setStreaming(false);
        }
    }, [reset, setStreaming, setStage, setTargetYears, addSource, setAnswer, setError, setTraversalLog, addToHistory]);

    const cancelQuery = useCallback(() => {
        controllerRef.current.cancel();
        setStreaming(false);
        setError('Query cancelled');
    }, [setStreaming, setError]);

    return {
        // State
        isStreaming,
        currentStage,
        stageMessage,
        targetYears,
        sources,
        answer,
        error,
        traversalLog,

        // Actions
        executeQuery,
        cancelQuery,
        reset,
    };
}
