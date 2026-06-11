import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: Props) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <Icon className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
            {action}
        </div>
    );
}
