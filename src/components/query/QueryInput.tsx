import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';

interface QueryInputProps {
    onSubmit: (query: string) => void;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function QueryInput({ onSubmit, isLoading, onCancel }: QueryInputProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !isLoading) {
            onSubmit(query.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <motion.div
                className={clsx(
                    'relative rounded-2xl transition-all duration-300',
                    isFocused && 'shadow-glow-primary'
                )}
                animate={{
                    boxShadow: isFocused
                        ? '0 0 0 3px rgba(0, 102, 255, 0.15), 0 10px 40px -10px rgba(0, 102, 255, 0.3)'
                        : '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
                }}
            >
                <div
                    className={clsx(
                        'relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300',
                        'bg-gradient-to-br from-[var(--bg-tertiary)]/80 to-[var(--bg-secondary)]',
                        isFocused
                            ? 'border-[var(--primary-500)]'
                            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                    )}
                >
                    {/* Icon */}
                    <div className={clsx(
                        'flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-300',
                        isFocused
                            ? 'bg-[var(--primary-500)]/20 text-[var(--primary-400)]'
                            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                    )}>
                        <Sparkles className="w-5 h-5" />
                    </div>

                    {/* Input */}
                    <div className="flex-1 min-h-[60px]">
                        <textarea
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about financial documents..."
                            className={clsx(
                                'w-full bg-transparent border-none resize-none',
                                'text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                                'focus:outline-none'
                            )}
                            rows={2}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            Press Enter to submit • Shift + Enter for new line
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-2">
                        {isLoading ? (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onCancel}
                                className="!px-4"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!query.trim()}
                                rightIcon={<ArrowRight className="w-4 h-4" />}
                            >
                                Analyze
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </form>
    );
}
