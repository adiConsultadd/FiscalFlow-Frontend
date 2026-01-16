import { create } from 'zustand';
import type { SourceChunk, StreamStage, QueryHistoryItem } from '../types';

interface QueryStore {
    // Streaming State
    isStreaming: boolean;
    currentStage: StreamStage | null;
    stageMessage: string;
    targetYears: string[];
    sources: SourceChunk[];
    answer: string;
    error: string | null;
    traversalLog: string[];

    // Active Citation
    activeCitationId: number | null;

    // History
    history: QueryHistoryItem[];

    // Actions
    setStreaming: (streaming: boolean) => void;
    setStage: (stage: StreamStage, message: string) => void;
    setTargetYears: (years: string[]) => void;
    addSource: (source: SourceChunk) => void;
    setAnswer: (answer: string) => void;
    setError: (error: string | null) => void;
    addToTraversalLog: (log: string) => void;
    setTraversalLog: (logs: string[]) => void;
    setActiveCitation: (id: number | null) => void;
    reset: () => void;

    // History Actions
    addToHistory: (item: QueryHistoryItem) => void;
    clearHistory: () => void;
    loadHistory: () => void;
}

const initialState = {
    isStreaming: false,
    currentStage: null as StreamStage | null,
    stageMessage: '',
    targetYears: [] as string[],
    sources: [] as SourceChunk[],
    answer: '',
    error: null as string | null,
    traversalLog: [] as string[],
    activeCitationId: null as number | null,
};

export const useQueryStore = create<QueryStore>((set, get) => ({
    ...initialState,
    history: [],

    setStreaming: (streaming) => set({ isStreaming: streaming }),

    setStage: (stage, message) => set({
        currentStage: stage,
        stageMessage: message
    }),

    setTargetYears: (years) => set({ targetYears: years }),

    addSource: (source) => set((state) => ({
        sources: [...state.sources, source]
    })),

    setAnswer: (answer) => set({ answer }),

    setError: (error) => set({ error, isStreaming: false }),

    addToTraversalLog: (log) => set((state) => ({
        traversalLog: [...state.traversalLog, log]
    })),

    setTraversalLog: (logs) => set({ traversalLog: logs }),

    setActiveCitation: (id) => set({ activeCitationId: id }),

    reset: () => set(initialState),

    addToHistory: (item) => {
        const history = [item, ...get().history].slice(0, 20); // Keep last 20
        set({ history });
        try {
            localStorage.setItem('fiscalflow_history', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    },

    clearHistory: () => {
        set({ history: [] });
        try {
            localStorage.removeItem('fiscalflow_history');
        } catch (e) {
            console.error('Failed to clear history:', e);
        }
    },

    loadHistory: () => {
        try {
            const saved = localStorage.getItem('fiscalflow_history');
            if (saved) {
                set({ history: JSON.parse(saved) });
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    },
}));
