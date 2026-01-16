import { clsx } from 'clsx';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) {
    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    };

    const style: React.CSSProperties = {
        width: width,
        height: height,
    };

    return (
        <div
            className={clsx(
                'skeleton',
                variants[variant],
                className
            )}
            style={style}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-5 rounded-2xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-default)]">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                    <Skeleton height={14} width="60%" className="mb-2" />
                    <Skeleton height={12} width="40%" />
                </div>
            </div>
            <Skeleton height={60} className="mb-3" />
            <div className="flex gap-2">
                <Skeleton height={24} width={60} />
                <Skeleton height={24} width={80} />
            </div>
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height={16}
                    width={i === lines - 1 ? '70%' : '100%'}
                    variant="text"
                />
            ))}
        </div>
    );
}
