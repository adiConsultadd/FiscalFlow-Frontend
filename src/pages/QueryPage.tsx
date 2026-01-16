import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, FileText, ChevronDown, ChevronUp, BookOpen, Copy, Check, AlertCircle, X, ArrowRight, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStreamingQuery } from '../hooks/useStreamingQuery';
import { useQueryStore } from '../store/queryStore';
import type { SourceChunk, StreamStage } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clsx } from 'clsx';

// Fixed company for now
const COMPANY = { ticker: 'one97', displayName: 'PAYTM', name: 'One97 Communications' };

// Stage configuration for progress
const stages: { id: StreamStage; label: string }[] = [
    { id: 'started', label: 'Started' },
    { id: 'time_scoping', label: 'Analyzing' },
    { id: 'years_identified', label: 'Years Found' },
    { id: 'retrieving_sources', label: 'Getting Sources' },
    { id: 'synthesizing', label: 'Generating' },
];

// Example queries
const exampleQueries = [
    { text: "How did revenue evolve from FY24 to FY26?", icon: TrendingUp },
    { text: "Compare EBITDA margins across quarters", icon: BarChart3 },
    { text: "What were the key risks mentioned in Q2 FY25?", icon: ShieldCheck },
];

export function QueryPage() {
    const [query, setQuery] = useState('');
    const [copied, setCopied] = useState(false);

    const {
        isStreaming,
        currentStage,
        stageMessage,
        targetYears,
        sources,
        answer,
        error,
        executeQuery,
        cancelQuery,
        reset,
    } = useStreamingQuery();

    const { activeCitationId, setActiveCitation } = useQueryStore();
    const hasResults = answer || sources.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !isStreaming) {
            executeQuery('user', query.trim(), COMPANY.ticker);
        }
    };

    const handleExampleClick = (text: string) => {
        setQuery(text);
        executeQuery('user', text, COMPANY.ticker);
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(answer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNewQuery = () => {
        reset();
        setQuery('');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3" onClick={handleNewQuery}>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-lg text-[var(--text-primary)] leading-tight">FiscalFlow</h1>
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">AI Financial Analysis</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3">
                            {/* Company Badge */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-white">
                                    PA
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-medium text-[var(--text-primary)] leading-tight">{COMPANY.displayName}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{COMPANY.name}</p>
                                </div>
                            </div>

                            <Link
                                to="/history"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                <History className="w-4 h-4" />
                                <span className="hidden sm:inline">History</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Hero - Only show when no results */}
                <AnimatePresence mode="wait">
                    {!hasResults && !isStreaming && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center mb-8 sm:mb-12"
                        >
                            <h2 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
                                Ask anything about
                                <span className="text-gradient"> financial documents</span>
                            </h2>
                            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
                                Get AI-powered answers from SEC filings with exact source citations
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Query Input */}
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className={clsx(
                        'relative rounded-2xl border transition-all duration-300',
                        'bg-[var(--bg-secondary)]',
                        isStreaming
                            ? 'border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10'
                            : 'border-[var(--border-default)] focus-within:border-[var(--primary-500)] focus-within:shadow-lg focus-within:shadow-[var(--primary-500)]/10'
                    )}>
                        <div className="flex items-center gap-3 p-3 sm:p-4">
                            <Sparkles className={clsx(
                                'w-5 h-5 flex-shrink-0',
                                isStreaming ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--text-muted)]'
                            )} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask about revenue, risks, margins..."
                                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base sm:text-lg focus:outline-none"
                                disabled={isStreaming}
                            />
                            {isStreaming ? (
                                <button
                                    type="button"
                                    onClick={cancelQuery}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--error)]/10 text-[var(--error)] text-sm font-medium hover:bg-[var(--error)]/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="hidden sm:inline">Cancel</span>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!query.trim()}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                        query.trim()
                                            ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent)] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
                                    )}
                                >
                                    <span className="hidden sm:inline">Analyze</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Example Queries - Only show when no results */}
                <AnimatePresence>
                    {!hasResults && !isStreaming && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-wrap gap-2 justify-center mb-8"
                        >
                            {exampleQueries.map((example, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleClick(example.text)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:border-[var(--primary-500)] hover:text-[var(--primary-400)] transition-all"
                                >
                                    <example.icon className="w-3.5 h-3.5" />
                                    <span className="max-w-[200px] truncate">{example.text}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Streaming Progress */}
                <AnimatePresence>
                    {isStreaming && currentStage && currentStage !== 'complete' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6"
                        >
                            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-default)] p-4 sm:p-6">
                                {/* Progress Bar */}
                                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                                    {stages.map((stage, index) => {
                                        const currentIndex = stages.findIndex(s => s.id === currentStage);
                                        const isActive = index === currentIndex;
                                        const isCompleted = index < currentIndex;

                                        return (
                                            <div key={stage.id} className="flex items-center flex-shrink-0">
                                                <div className={clsx(
                                                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                                                    isCompleted && 'bg-[var(--accent)]/20 text-[var(--accent)]',
                                                    isActive && 'bg-[var(--primary-500)]/20 text-[var(--primary-400)]',
                                                    !isActive && !isCompleted && 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                                )}>
                                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                                                    {stage.label}
                                                </div>
                                                {index < stages.length - 1 && (
                                                    <div className={clsx(
                                                        'w-4 h-0.5 mx-1 rounded-full',
                                                        isCompleted ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
                                                    )} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Status */}
                                <p className="text-sm text-[var(--text-secondary)]">{stageMessage}</p>

                                {/* Target Years */}
                                {targetYears.length > 0 && (
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <span className="text-xs text-[var(--text-muted)]">Analyzing:</span>
                                        {targetYears.map(year => (
                                            <span key={year} className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
                                                {year}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-2xl bg-[var(--error)]/10 border border-[var(--error)]/20 flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
                        <p className="text-sm text-[var(--error)]">{error}</p>
                        <button onClick={handleNewQuery} className="ml-auto text-sm text-[var(--error)] underline">
                            Try again
                        </button>
                    </motion.div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {hasResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* New Query Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleNewQuery}
                                    className="text-sm text-[var(--primary-400)] hover:text-[var(--primary-300)] font-medium"
                                >
                                    ← New Query
                                </button>
                            </div>

                            {/* Answer Card */}
                            {answer && (
                                <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
                                    {/* Answer Header */}
                                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--border-default)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">AI Analysis</h3>
                                                <p className="text-xs text-[var(--text-muted)]">{sources.length} sources cited</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>

                                    {/* Answer Content */}
                                    <div className="px-4 sm:px-6 py-4 sm:py-6 prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {answer}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Sources */}
                            {sources.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Source Citations ({sources.length})
                                    </h3>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {sources.map((source) => (
                                            <SourceCard
                                                key={source.evidence_id}
                                                source={source}
                                                isActive={activeCitationId === source.evidence_id}
                                                onClick={() => setActiveCitation(
                                                    activeCitationId === source.evidence_id ? null : source.evidence_id
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--border-default)] mt-auto">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                        Powered by AI with full source provenance • Every claim is verified
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Source Card Component
function SourceCard({ source, isActive, onClick }: {
    source: SourceChunk;
    isActive: boolean;
    onClick: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            className={clsx(
                'rounded-xl border transition-all cursor-pointer overflow-hidden',
                'bg-[var(--bg-secondary)]',
                isActive
                    ? 'border-[var(--primary-500)] ring-2 ring-[var(--primary-500)]/20'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
            )}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start gap-3 p-3 sm:p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-xs font-bold text-white">
                    {source.evidence_id}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {source.fiscal_year && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--primary-500)]/15 text-[var(--primary-300)]">
                                {source.fiscal_year}
                            </span>
                        )}
                        {source.fiscal_quarter && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
                                {source.fiscal_quarter}
                            </span>
                        )}
                        <span className={clsx(
                            'px-1.5 py-0.5 rounded text-[10px] font-medium',
                            source.similarity >= 0.8 && 'bg-[var(--success)]/15 text-[var(--success)]',
                            source.similarity >= 0.6 && source.similarity < 0.8 && 'bg-[var(--warning)]/15 text-[var(--warning)]',
                            source.similarity < 0.6 && 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                        )}>
                            {Math.round(source.similarity * 100)}% match
                        </span>
                    </div>

                    {/* Content */}
                    <p className={clsx(
                        'text-sm text-[var(--text-secondary)] leading-relaxed',
                        !isExpanded && 'line-clamp-2'
                    )}>
                        {source.text_content}
                    </p>

                    {source.text_content.length > 150 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="flex items-center gap-1 mt-2 text-xs text-[var(--primary-400)] hover:text-[var(--primary-300)]"
                        >
                            {isExpanded ? (
                                <>Show less <ChevronUp className="w-3 h-3" /></>
                            ) : (
                                <>Show more <ChevronDown className="w-3 h-3" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-[var(--bg-primary)]/50 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                {source.provenance.page_label && (
                    <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Page {source.provenance.page_label}
                    </span>
                )}
                {source.provenance.file_name && (
                    <span className="flex items-center gap-1 truncate">
                        <FileText className="w-3 h-3" />
                        {source.provenance.file_name}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
