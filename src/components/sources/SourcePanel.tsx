import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, ChevronRight, ChevronDown } from 'lucide-react';
import type { SourceChunk } from '../../types';
import { SourceCard } from './SourceCard';
import { SkeletonCard } from '../ui/Skeleton';
import { clsx } from 'clsx';
import { useState } from 'react';
import { useQueryStore } from '../../store/queryStore';

interface SourcePanelProps {
    sources: SourceChunk[];
    isLoading?: boolean;
}

export function SourcePanel({ sources, isLoading }: SourcePanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { activeCitationId, setActiveCitation } = useQueryStore();

    // Group sources by fiscal year
    const groupedSources = sources.reduce((acc, source) => {
        const key = source.fiscal_year || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(source);
        return acc;
    }, {} as Record<string, SourceChunk[]>);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={clsx(
                    'flex items-center justify-between w-full px-4 py-3',
                    'bg-[var(--bg-tertiary)]/50 border-b border-[var(--border-default)]',
                    'hover:bg-[var(--bg-tertiary)] transition-colors'
                )}
            >
                <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-medium text-[var(--text-primary)]">Sources</span>
                    {sources.length > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent-light)] rounded-full">
                            {sources.length}
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                )}
            </button>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-y-auto"
                    >
                        <div className="p-4 space-y-4">
                            {isLoading && sources.length === 0 ? (
                                // Loading skeleton
                                <div className="space-y-4">
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </div>
                            ) : sources.length === 0 ? (
                                // Empty state
                                <div className="text-center py-8">
                                    <FileSearch className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Sources will appear here as they are retrieved
                                    </p>
                                </div>
                            ) : (
                                // Grouped sources
                                Object.entries(groupedSources).map(([year, yearSources]) => (
                                    <div key={year}>
                                        {Object.keys(groupedSources).length > 1 && (
                                            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                                                {year}
                                            </h4>
                                        )}
                                        <div className="space-y-3">
                                            {yearSources.map((source) => (
                                                <SourceCard
                                                    key={source.evidence_id}
                                                    source={source}
                                                    isActive={activeCitationId === source.evidence_id}
                                                    onClick={() => setActiveCitation(source.evidence_id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
