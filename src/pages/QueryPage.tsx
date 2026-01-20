import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, ChevronDown, ChevronUp, BookOpen, Copy, Check, AlertCircle, X, ArrowRight, TrendingUp, BarChart3, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStreamingQuery } from '../hooks/useStreamingQuery';
import { useQueryStore } from '../store/queryStore';
import type { SourceChunk, StreamStage } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clsx } from 'clsx';
import { PDFViewer } from '../components/pdf/PDFViewer';

// Company options
const COMPANIES = [
    { ticker: 'one97', displayName: 'PAYTM', name: 'One97 Communications', initials: 'PA', available: true },
    { ticker: 'tatasteel', displayName: 'Tata Steel', name: 'Tata Steel Ltd', initials: 'TS', available: false },
    { ticker: 'irfc', displayName: 'IRFC', name: 'Indian Railway Finance', initials: 'IR', available: false },
    { ticker: 'reliance', displayName: 'Reliance', name: 'Reliance Industries', initials: 'RL', available: false },
    { ticker: 'tcs', displayName: 'TCS', name: 'Tata Consultancy Services', initials: 'TC', available: false },
    { ticker: 'hdfc', displayName: 'HDFC Bank', name: 'HDFC Bank Ltd', initials: 'HD', available: false },
    { ticker: 'infosys', displayName: 'Infosys', name: 'Infosys Ltd', initials: 'IN', available: false },
    { ticker: 'icici', displayName: 'ICICI Bank', name: 'ICICI Bank Ltd', initials: 'IC', available: false },
];

// Default selected company
const DEFAULT_COMPANY = COMPANIES[0];

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
    const [pdfSource, setPdfSource] = useState<SourceChunk | null>(null);
    const [selectedCompany, setSelectedCompany] = useState(DEFAULT_COMPANY);
    const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setCompanyDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            executeQuery('user', query.trim(), selectedCompany.ticker);
        }
    };

    const handleExampleClick = (text: string) => {
        setQuery(text);
        executeQuery('user', text, selectedCompany.ticker);
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

    // Handle citation click - open PDF viewer for that source
    const handleCitationClick = (evidenceId: number) => {
        const source = sources.find(s => s.evidence_id === evidenceId);
        if (source) {
            setPdfSource(source);
            setActiveCitation(evidenceId);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
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
                                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Corporate Intelligence</p>
                            </div>
                        </Link>

                        {/* Company Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-colors"
                            >
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-white">
                                    {selectedCompany.initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-medium text-[var(--text-primary)] leading-tight">{selectedCompany.displayName}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{selectedCompany.name}</p>
                                </div>
                                <ChevronDown className={clsx(
                                    'w-4 h-4 text-[var(--text-muted)] transition-transform',
                                    companyDropdownOpen && 'rotate-180'
                                )} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {companyDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl shadow-xl overflow-hidden z-50"
                                    >
                                        {COMPANIES.map((company) => (
                                            <button
                                                key={company.ticker}
                                                onClick={() => {
                                                    if (company.available) {
                                                        setSelectedCompany(company);
                                                        setCompanyDropdownOpen(false);
                                                    }
                                                }}
                                                disabled={!company.available}
                                                className={clsx(
                                                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                                    company.available
                                                        ? 'hover:bg-[var(--bg-tertiary)] cursor-pointer'
                                                        : 'opacity-60 cursor-not-allowed',
                                                    selectedCompany.ticker === company.ticker && 'bg-[var(--primary-500)]/10'
                                                )}
                                            >
                                                <div className={clsx(
                                                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white',
                                                    company.available
                                                        ? 'bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)]'
                                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                                )}>
                                                    {company.initials}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-[var(--text-primary)]">{company.displayName}</p>
                                                        {!company.available && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/20 text-[var(--warning)] font-medium">
                                                                Coming Soon
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[var(--text-muted)]">{company.name}</p>
                                                </div>
                                                {selectedCompany.ticker === company.ticker && company.available && (
                                                    <Check className="w-4 h-4 text-[var(--primary-400)]" />
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
                {/* Hero - Only show when no results */}
                <AnimatePresence mode="wait">
                    {!hasResults && !isStreaming && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col gap-4 items-center text-center mb-8 sm:mb-12"
                        >
                            <h2 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
                                Ask anything about
                                <span className="text-gradient"> corporate documents</span>
                            </h2>
                            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mb-6">
                                Get instant, AI-powered insights from quarterly results, concalls, investor presentations, and transcripts with verifiable source citations
                            </p>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap gap-3 justify-center text-xs text-[var(--text-muted)]">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
                                    Verifiable Sources
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-400)]"></span>
                                    Real-time Analysis
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                                    Direct Document Links
                                </span>
                            </div>
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
                                        <AnswerWithCitations
                                            answer={answer}
                                            onCitationClick={handleCitationClick}
                                        />
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
                                                onViewDocument={() => setPdfSource(source)}
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

            {/* PDF Viewer Modal */}
            {pdfSource && (
                <PDFViewer
                    source={pdfSource}
                    isOpen={!!pdfSource}
                    onClose={() => setPdfSource(null)}
                />
            )}
        </div>
    );
}

// Source Card Component
function SourceCard({ source, isActive, onClick, onViewDocument }: {
    source: SourceChunk;
    isActive: boolean;
    onClick: () => void;
    onViewDocument: () => void;
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
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[var(--bg-primary)]/50 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    {source.provenance.page_label && (
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Page {source.provenance.page_label}
                        </span>
                    )}
                    {source.provenance.file_name && (
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <FileText className="w-3 h-3" />
                            {source.provenance.file_name}
                        </span>
                    )}
                </div>

                {/* View Document Button */}
                {source.provenance.file_name && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDocument();
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent)]/25 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" />
                        View Doc
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Component to render answer with clickable citation links
function AnswerWithCitations({
    answer,
    onCitationClick
}: {
    answer: string;
    onCitationClick: (evidenceId: number) => void;
}) {
    // Parse answer and convert citation references to clickable links
    // Matches patterns like: [Evidence 1], [1], [Source 2], [Ref 3], etc.
    const citationPattern = /\[(?:Evidence|Source|Ref|Citation)?\s*(\d+)\]/gi;

    // Split the answer by citation patterns
    const parts: (string | { type: 'citation'; id: number; text: string })[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = citationPattern.exec(answer)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(answer.slice(lastIndex, match.index));
        }

        // Add the citation as a special object
        parts.push({
            type: 'citation',
            id: parseInt(match[1]),
            text: match[0]
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < answer.length) {
        parts.push(answer.slice(lastIndex));
    }

    // Render with ReactMarkdown for text parts and custom links for citations
    return (
        <div className="answer-with-citations">
            {parts.map((part, index) => {
                if (typeof part === 'string') {
                    // Render markdown for text parts
                    return (
                        <ReactMarkdown
                            key={index}
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Render paragraphs inline to avoid breaking flow
                                p: ({ children }) => <span>{children}</span>
                            }}
                        >
                            {part}
                        </ReactMarkdown>
                    );
                } else {
                    // Render citation as clickable link
                    return (
                        <button
                            key={index}
                            onClick={() => onCitationClick(part.id)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-[var(--primary-500)]/20 text-[var(--primary-400)] text-sm font-medium hover:bg-[var(--primary-500)]/30 hover:text-[var(--primary-300)] transition-colors cursor-pointer border-none"
                            title={`Click to view source ${part.id}`}
                        >
                            <FileText className="w-3 h-3" />
                            {part.text}
                        </button>
                    );
                }
            })}
        </div>
    );
}
