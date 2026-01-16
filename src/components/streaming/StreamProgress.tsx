import { motion } from 'framer-motion';
import { Check, Clock, Search, FileText, Sparkles, Loader2 } from 'lucide-react';
import type { StreamStage } from '../../types';
import { clsx } from 'clsx';

interface StreamProgressProps {
    currentStage: StreamStage | null;
    message?: string;
    targetYears?: string[];
}

const stages: { id: StreamStage; label: string; icon: React.ElementType }[] = [
    { id: 'started', label: 'Query Received', icon: Clock },
    { id: 'time_scoping', label: 'Analyzing Timeframe', icon: Search },
    { id: 'years_identified', label: 'Years Identified', icon: Check },
    { id: 'retrieving_sources', label: 'Retrieving Sources', icon: FileText },
    { id: 'synthesizing', label: 'Generating Analysis', icon: Sparkles },
];

export function StreamProgress({ currentStage, message, targetYears }: StreamProgressProps) {
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    const isComplete = currentStage === 'complete';

    return (
        <div className="w-full">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-6">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isActive = index === currentIndex;
                    const isCompleted = isComplete || index < currentIndex;

                    return (
                        <div key={stage.id} className="flex items-center flex-1">
                            <motion.div
                                className={clsx(
                                    'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                                    isCompleted && 'bg-[var(--accent)] border-[var(--accent)]',
                                    isActive && !isCompleted && 'bg-[var(--primary-500)]/20 border-[var(--primary-500)]',
                                    !isActive && !isCompleted && 'bg-[var(--bg-tertiary)] border-[var(--border-default)]'
                                )}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-[var(--text-inverse)]" />
                                ) : isActive ? (
                                    <Loader2 className="w-5 h-5 text-[var(--primary-400)] animate-spin" />
                                ) : (
                                    <Icon className="w-5 h-5 text-[var(--text-muted)]" />
                                )}

                                {/* Pulse animation for active stage */}
                                {isActive && !isCompleted && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-[var(--primary-500)]"
                                        initial={{ scale: 1, opacity: 0.5 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>

                            {/* Connector line */}
                            {index < stages.length - 1 && (
                                <div className="flex-1 h-0.5 mx-2 bg-[var(--bg-tertiary)] overflow-hidden rounded-full">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--primary-500)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: isCompleted || index < currentIndex ? '100%' : 0 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Stage Labels */}
            <div className="flex justify-between mb-4">
                {stages.map((stage, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = isComplete || index < currentIndex;

                    return (
                        <div
                            key={stage.id}
                            className={clsx(
                                'text-xs font-medium text-center flex-1 transition-colors duration-300',
                                isActive && 'text-[var(--primary-400)]',
                                isCompleted && 'text-[var(--accent)]',
                                !isActive && !isCompleted && 'text-[var(--text-muted)]'
                            )}
                        >
                            {stage.label}
                        </div>
                    );
                })}
            </div>

            {/* Status Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <p className="text-sm text-[var(--text-secondary)]">{message}</p>

                    {/* Target Years Display */}
                    {targetYears && targetYears.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center gap-2 mt-3"
                        >
                            <span className="text-xs text-[var(--text-muted)]">Analyzing:</span>
                            {targetYears.map((year) => (
                                <span
                                    key={year}
                                    className="px-2 py-1 text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent-light)] rounded-lg"
                                >
                                    {year}
                                </span>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
