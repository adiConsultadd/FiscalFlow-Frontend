import { motion } from 'framer-motion';
import { History, Trash2, Clock, ArrowLeft, MessageSquare, Sparkles, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryHistory } from '../hooks/useQueryHistory';

export function HistoryPage() {
    const { history, clearHistory } = useQueryHistory();
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-lg text-[var(--text-primary)] leading-tight">FiscalFlow</h1>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">AI Financial Analysis</p>
                            </div>
                        </Link>

                        <Link
                            to="/"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <History className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Query History</h2>
                            <p className="text-xs text-[var(--text-muted)]">
                                {history.length} {history.length === 1 ? 'query' : 'queries'} saved
                            </p>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    )}
                </div>

                {/* History List */}
                {history.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-[var(--text-muted)]" />
                        </div>
                        <h3 className="font-medium text-[var(--text-primary)] mb-2">No queries yet</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-6">
                            Your query history will appear here
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent)] text-white text-sm font-medium"
                        >
                            Start Querying
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {history.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                                onClick={() => navigate('/')}
                            >
                                {/* Query */}
                                <h3 className="font-medium text-[var(--text-primary)] text-sm sm:text-base mb-2 line-clamp-2">
                                    {item.query}
                                </h3>

                                {/* Answer Preview */}
                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                                    {item.answer.slice(0, 150)}...
                                </p>

                                {/* Metadata */}
                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                    <span className="flex items-center gap-1 text-[var(--text-muted)]">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(item.timestamp)}
                                    </span>
                                    {item.target_years.map((year) => (
                                        <span key={year} className="px-1.5 py-0.5 rounded bg-[var(--primary-500)]/15 text-[var(--primary-300)] font-medium">
                                            {year}
                                        </span>
                                    ))}
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-medium">
                                        <FileText className="w-3 h-3" />
                                        {item.sources.length}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
