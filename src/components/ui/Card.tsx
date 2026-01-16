import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'interactive' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    className,
    ...props
}: CardProps) {
    const baseStyles = 'rounded-2xl transition-all duration-300';

    const variants = {
        default: 'bg-gradient-to-br from-[var(--bg-tertiary)]/50 to-[var(--bg-secondary)]/80 border border-[var(--border-default)]',
        elevated: 'bg-gradient-to-br from-[var(--bg-tertiary)]/50 to-[var(--bg-secondary)]/80 border border-[var(--border-default)] shadow-xl',
        interactive: 'bg-gradient-to-br from-[var(--bg-tertiary)]/50 to-[var(--bg-secondary)]/80 border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        glass: 'glass',
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-7',
    };

    return (
        <div
            className={clsx(baseStyles, variants[variant], paddings[padding], className)}
            {...props}
        >
            {children}
        </div>
    );
}
