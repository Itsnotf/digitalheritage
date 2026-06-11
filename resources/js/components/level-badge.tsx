import { cn } from '@/lib/utils';

// -------------------------------------------------------
// Konfigurasi level — sinkron dengan logika di User model PHP
// -------------------------------------------------------

export interface LevelConfig {
    level: number;
    name: string;
    min: number;
    badgeClasses: string;
    dotClass: string;
}

export const LEVEL_CONFIG: LevelConfig[] = [
    {
        level: 1,
        name: 'Pendatang',
        min: 0,
        badgeClasses: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-700',
        dotClass: 'bg-gray-400 dark:bg-gray-500',
    },
    {
        level: 2,
        name: 'Pemuda',
        min: 1,
        badgeClasses: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        dotClass: 'bg-amber-500',
    },
    {
        level: 3,
        name: 'Penjaga',
        min: 5,
        badgeClasses: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',
        dotClass: 'bg-teal-500',
    },
    {
        level: 4,
        name: 'Duta Budaya',
        min: 15,
        badgeClasses: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
        dotClass: 'bg-purple-500',
    },
    {
        level: 5,
        name: 'Maestro',
        min: 30,
        badgeClasses: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        dotClass: 'bg-orange-500',
    },
];

/**
 * Kalkulasi level dari jumlah konten yang disetujui.
 * Sinkron dengan User::getLevel() di PHP.
 */
export function getLevelConfig(approvedCount: number): LevelConfig {
    return (
        [...LEVEL_CONFIG].reverse().find((l) => approvedCount >= l.min) ?? LEVEL_CONFIG[0]
    );
}

/**
 * Hitung berapa konten lagi untuk naik level.
 * Null jika sudah di level maksimal (Maestro).
 */
export function getKontenToNextLevel(approvedCount: number): number | null {
    const thresholds = [1, 5, 15, 30];
    const current    = getLevelConfig(approvedCount);
    if (current.level >= 5) return null;
    return thresholds[current.level - 1] - approvedCount;
}

// -------------------------------------------------------
// Komponen
// -------------------------------------------------------

interface Props {
    /** Jumlah konten yang sudah disetujui admin */
    approvedCount: number;
    /** Tampilkan jumlah konten di samping nama level */
    showCount?: boolean;
    /** Tampilkan progress "N lagi ke level berikutnya" */
    showProgress?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export default function LevelBadge({
    approvedCount,
    showCount = false,
    showProgress = false,
    size = 'md',
    className,
}: Props) {
    const config      = getLevelConfig(approvedCount);
    const toNextLevel = getKontenToNextLevel(approvedCount);

    return (
        <div className={cn('inline-flex flex-col items-start gap-1', className)}>
            {/* Badge utama */}
            <span
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border font-medium',
                    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
                    config.badgeClasses,
                )}
            >
                <span className={cn('rounded-full', size === 'sm' ? 'size-1.5' : 'size-2', config.dotClass)} />
                {config.name}
                {showCount && (
                    <span className="opacity-60">· {approvedCount}</span>
                )}
            </span>

            {/* Progress ke level berikutnya */}
            {showProgress && toNextLevel !== null && (
                <span className="text-xs text-muted-foreground">
                    {toNextLevel} konten lagi ke level berikutnya
                </span>
            )}
            {showProgress && toNextLevel === null && (
                <span className="text-xs text-muted-foreground">Level tertinggi 🎉</span>
            )}
        </div>
    );
}
