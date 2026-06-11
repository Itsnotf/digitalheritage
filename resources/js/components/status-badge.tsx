import { cn } from '@/lib/utils';
import { KontenStatus } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface Props {
    status: KontenStatus;
    size?: 'sm' | 'md';
}

const config: Record<KontenStatus, { label: string; icon: React.ElementType; classes: string }> = {
    pending: {
        label: 'Menunggu Review',
        icon: Clock,
        classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    },
    published: {
        label: 'Tayang',
        icon: CheckCircle,
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    },
    rejected: {
        label: 'Ditolak',
        icon: XCircle,
        classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    },
};

export default function StatusBadge({ status, size = 'md' }: Props) {
    const { label, icon: Icon, classes } = config[status];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-medium',
                size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
                classes,
            )}
        >
            <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} />
            {label}
        </span>
    );
}
