import { MediaTipe } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, Headphones, ImageIcon, Video } from 'lucide-react';

const config: Record<MediaTipe, { icon: React.ElementType; label: string; classes: string }> = {
    image: {
        icon: ImageIcon,
        label: 'Gambar',
        classes: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    },
    video: {
        icon: Video,
        label: 'Video',
        classes: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    },
    audio: {
        icon: Headphones,
        label: 'Audio',
        classes: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    },
    document: {
        icon: FileText,
        label: 'Dokumen',
        classes: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
    },
};

interface Props {
    tipe: MediaTipe;
    size?: 'sm' | 'md' | 'lg';
}

export default function MediaTypeIcon({ tipe, size = 'md' }: Props) {
    const { icon: Icon, label, classes } = config[tipe];

    const sizes = { sm: 'size-6', md: 'size-9', lg: 'size-12' };
    const iconSizes = { sm: 'size-3', md: 'size-4', lg: 'size-6' };

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-md',
                sizes[size],
                classes,
            )}
            title={label}
        >
            <Icon className={iconSizes[size]} />
        </div>
    );
}
