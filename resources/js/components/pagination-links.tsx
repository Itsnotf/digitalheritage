import { PaginationLink } from '@/types';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Props {
    links: PaginationLink[];
    className?: string;
}

export default function PaginationLinks({ links, className }: Props) {
    if (links.length <= 3) return null; // prev + 1 page + next = not needed

    return (
        <div className={cn('flex flex-wrap items-center gap-1', className)}>
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url ?? '#'}
                    preserveScroll
                    preserveState
                    className={cn(
                        'flex min-w-9 items-center justify-center rounded-md border px-3 py-1.5 text-sm transition-colors',
                        link.active
                            ? 'border-primary bg-primary text-primary-foreground font-medium'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                        !link.url && 'pointer-events-none opacity-40',
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
