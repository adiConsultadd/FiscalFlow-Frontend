import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    inputSize?: 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    leftIcon,
    rightIcon,
    inputSize = 'md',
    className,
    ...props
}, ref) => {
    const sizes = {
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        'w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-xl',
                        'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                        'transition-all duration-200',
                        'hover:border-[var(--border-strong)]',
                        'focus:outline-none focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-500)]/10',
                        sizes[inputSize],
                        leftIcon && 'pl-12',
                        rightIcon && 'pr-12',
                        error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/10',
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
