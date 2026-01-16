import { motion } from 'framer-motion';

export function StreamingIndicator() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[var(--accent)]"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </div>
            <span className="text-sm text-[var(--text-secondary)]">Analyzing...</span>
        </div>
    );
}

export function PulsingDot() {
    return (
        <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
            <motion.div
                className="absolute inset-0 rounded-full bg-[var(--accent)]"
                animate={{
                    scale: [1, 2],
                    opacity: [0.5, 0],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                }}
            />
        </div>
    );
}
