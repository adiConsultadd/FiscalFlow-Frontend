import { useEffect } from 'react';
import { useQueryStore } from '../store/queryStore';

export function useQueryHistory() {
    const { history, loadHistory, clearHistory, addToHistory } = useQueryStore();

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return {
        history,
        clearHistory,
        addToHistory,
    };
}
