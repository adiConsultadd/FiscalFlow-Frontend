import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Building2, X } from 'lucide-react';
import { clsx } from 'clsx';

interface CompanySelectorProps {
    value?: string;
    onChange: (ticker: string | undefined) => void;
}

const companies = [
    { ticker: 'PAYTM', name: 'One97 Communications' },
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft' },
    { ticker: 'GOOGL', name: 'Alphabet' },
    { ticker: 'AMZN', name: 'Amazon' },
    { ticker: 'META', name: 'Meta Platforms' },
    { ticker: 'TSLA', name: 'Tesla' },
    { ticker: 'NVDA', name: 'NVIDIA' },
];

export function CompanySelector({ value, onChange }: CompanySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCompany = companies.find(c => c.ticker === value);

    const filteredCompanies = companies.filter(c =>
        c.ticker.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                    'bg-[var(--bg-tertiary)] border border-[var(--border-default)]',
                    'text-sm font-medium transition-all duration-200',
                    isOpen && 'border-[var(--primary-500)]',
                    'hover:border-[var(--border-strong)]'
                )}
            >
                <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                {selectedCompany ? (
                    <span className="text-[var(--text-primary)]">
                        {selectedCompany.ticker}
                    </span>
                ) : (
                    <span className="text-[var(--text-muted)]">All Companies</span>
                )}
                <ChevronDown className={clsx(
                    'w-4 h-4 text-[var(--text-muted)] transition-transform duration-200',
                    isOpen && 'rotate-180'
                )} />
                {selectedCompany && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(undefined);
                        }}
                        className="ml-1 p-0.5 rounded hover:bg-[var(--bg-elevated)]"
                    >
                        <X className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={clsx(
                            'absolute top-full left-0 mt-2 w-64 z-50',
                            'bg-[var(--bg-secondary)] border border-[var(--border-default)]',
                            'rounded-xl shadow-xl overflow-hidden'
                        )}
                    >
                        {/* Search */}
                        <div className="p-2 border-b border-[var(--border-default)]">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search companies..."
                                className={clsx(
                                    'w-full px-3 py-2 text-sm rounded-lg',
                                    'bg-[var(--bg-tertiary)] border-none',
                                    'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                                    'focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30'
                                )}
                                autoFocus
                            />
                        </div>

                        {/* Options */}
                        <div className="max-h-64 overflow-y-auto py-1">
                            {/* All Companies Option */}
                            <button
                                onClick={() => {
                                    onChange(undefined);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className={clsx(
                                    'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                                    'hover:bg-[var(--bg-tertiary)] transition-colors',
                                    !value && 'bg-[var(--primary-500)]/10'
                                )}
                            >
                                <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                                <span className="text-sm text-[var(--text-secondary)]">All Companies</span>
                            </button>

                            {filteredCompanies.map((company) => (
                                <button
                                    key={company.ticker}
                                    onClick={() => {
                                        onChange(company.ticker);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={clsx(
                                        'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                                        'hover:bg-[var(--bg-tertiary)] transition-colors',
                                        value === company.ticker && 'bg-[var(--primary-500)]/10'
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">
                                        {company.ticker.slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">{company.ticker}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{company.name}</p>
                                    </div>
                                </button>
                            ))}

                            {filteredCompanies.length === 0 && (
                                <p className="px-4 py-3 text-sm text-[var(--text-muted)] text-center">
                                    No companies found
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
