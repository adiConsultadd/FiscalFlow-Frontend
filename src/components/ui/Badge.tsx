import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md';
}

export function Badge({
    children,
    variant = 'neutral',
    size = 'md',
    className,
    ...props
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center gap-1 font-medium rounded-lg whitespace-nowrap';

    const variants = {
        primary: 'bg-[var(--primary-500)]/15 text-[var(--primary-300)]',
        accent: 'bg-[var(--accent)]/15 text-[var(--accent-light)]',
        success: 'bg-[var(--success)]/15 text-[var(--success-light)]',
        warning: 'bg-[var(--warning)]/15 text-[var(--warning-light)]',
        error: 'bg-[var(--error)]/15 text-[var(--error-light)]',
        info: 'bg-[var(--info)]/15 text-[var(--info-light)]',
        neutral: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
    };

    return (
        <span
            className={clsx(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </span>
    );
}
