import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, BarChart2, Users, FileText, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';

interface ExampleQueriesProps {
    onSelect: (query: string) => void;
}

const examples = [
    {
        text: "How did revenue evolve from FY24 to FY26?",
        icon: TrendingUp,
        category: "Revenue",
        gradient: "from-[#10b981] to-[#059669]",
    },
    {
        text: "What were the key risks mentioned in Q2 FY25?",
        icon: AlertTriangle,
        category: "Risks",
        gradient: "from-[#f59e0b] to-[#d97706]",
    },
    {
        text: "Compare EBITDA margins across quarters",
        icon: BarChart2,
        category: "Profitability",
        gradient: "from-[#8b5cf6] to-[#7c3aed]",
    },
    {
        text: "What is the merchant subscriber growth trend?",
        icon: Users,
        category: "Growth",
        gradient: "from-[#3b82f6] to-[#2563eb]",
    },
    {
        text: "Summarize the financial highlights of FY26",
        icon: FileText,
        category: "Summary",
        gradient: "from-[#14b8a6] to-[#0d9488]",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function ExampleQueries({ onSelect }: ExampleQueriesProps) {
    return (
        <div className="w-full">
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4 uppercase tracking-wider">
                Try an example
            </h3>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {examples.map((example, index) => {
                    const Icon = example.icon;
                    return (
                        <motion.button
                            key={index}
                            variants={itemVariants}
                            onClick={() => onSelect(example.text)}
                            className={clsx(
                                'group relative flex items-start gap-3 p-4 rounded-xl text-left',
                                'bg-gradient-to-br from-[var(--bg-tertiary)]/50 to-[var(--bg-secondary)]/80',
                                'border border-[var(--border-default)]',
                                'hover:border-[var(--border-strong)] hover:shadow-lg',
                                'transition-all duration-300'
                            )}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Icon */}
                            <div className={clsx(
                                'flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br',
                                example.gradient,
                                'shadow-lg'
                            )}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                    {example.category}
                                </span>
                                <p className="text-sm text-[var(--text-primary)] mt-0.5 line-clamp-2">
                                    {example.text}
                                </p>
                            </div>

                            {/* Hover Arrow */}
                            <ArrowUpRight className={clsx(
                                'w-4 h-4 text-[var(--text-muted)]',
                                'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                                'absolute top-3 right-3'
                            )} />
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
