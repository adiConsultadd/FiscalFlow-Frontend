import { motion } from 'framer-motion';
import { FileText, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { SourceChunk } from '../../types';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';
import { useState } from 'react';

interface SourceCardProps {
    source: SourceChunk;
    isActive?: boolean;
    onClick?: () => void;
}

export function SourceCard({ source, isActive, onClick }: SourceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const truncatedText = source.text_content.length > 200
        ? source.text_content.slice(0, 200) + '...'
        : source.text_content;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={clsx(
                'group relative rounded-xl overflow-hidden transition-all duration-300',
                'bg-gradient-to-br from-[var(--bg-tertiary)]/50 to-[var(--bg-secondary)]/80',
                'border',
                isActive
                    ? 'border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/20'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
            )}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 pb-2">
                {/* Evidence ID Badge */}
                <div className={clsx(
                    'flex items-center justify-center w-10 h-10 rounded-lg font-mono text-sm font-bold',
                    'bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)]',
                    'text-white shadow-lg'
                )}>
                    {source.evidence_id}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {source.fiscal_year && (
                            <Badge variant="primary" size="sm">
                                {source.fiscal_year}
                            </Badge>
                        )}
                        {source.fiscal_quarter && (
                            <Badge variant="accent" size="sm">
                                {source.fiscal_quarter}
                            </Badge>
                        )}
                        {source.company_ticker && (
                            <Badge variant="neutral" size="sm">
                                {source.company_ticker}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Relevance Score */}
                <div className="flex items-center gap-1.5">
                    <div className={clsx(
                        'w-12 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden'
                    )}>
                        <div
                            className={clsx(
                                'h-full rounded-full transition-all duration-500',
                                source.similarity >= 0.8 && 'bg-[var(--success)]',
                                source.similarity >= 0.6 && source.similarity < 0.8 && 'bg-[var(--warning)]',
                                source.similarity < 0.6 && 'bg-[var(--text-muted)]'
                            )}
                            style={{ width: `${source.similarity * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                        {Math.round(source.similarity * 100)}%
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    "{isExpanded ? source.text_content : truncatedText}"
                </p>
                {source.text_content.length > 200 && (
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

            {/* Provenance Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)]">
                {source.provenance.page_label && (
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-secondary)]">
                            Page {source.provenance.page_label}
                        </span>
                    </div>
                )}
                {source.provenance.file_name && (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                        <span className="text-xs text-[var(--text-secondary)] truncate">
                            {source.provenance.file_name}
                        </span>
                    </div>
                )}
                <button className="p-1 rounded hover:bg-[var(--bg-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
            </div>
        </motion.div>
    );
}
