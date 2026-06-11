import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface Props {
    value: number;
    max?: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function StarRating({
    value,
    max = 5,
    onChange,
    readonly = false,
    size = 'md',
    className,
}: Props) {
    const [hover, setHover] = useState(0);

    const sizes = { sm: 'size-4', md: 'size-5', lg: 'size-6' };

    return (
        <div className={cn('inline-flex items-center gap-0.5', className)} role="group" aria-label={`Rating: ${value} dari ${max}`}>
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
                const filled = (hover || value) >= star;

                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onChange?.(star)}
                        onMouseEnter={() => !readonly && setHover(star)}
                        onMouseLeave={() => !readonly && setHover(0)}
                        aria-label={`${star} bintang`}
                        className={cn(
                            'transition-transform',
                            !readonly && 'cursor-pointer hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',
                            readonly && 'cursor-default',
                        )}
                    >
                        <Star
                            className={cn(
                                sizes[size],
                                'transition-colors',
                                filled ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300',
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
