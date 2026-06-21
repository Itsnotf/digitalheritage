import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: Permission[];
}
export interface BreadcrumbItem { title: string; href: string; }
export interface NavGroup { title: string; items: NavItem[]; }
export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    permissions?: string[];
    isActive?: boolean;
    external?: boolean;
}
export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}
export interface User {
    id: number; name: string; email: string; avatar?: string; bio?: string | null;
    email_verified_at: string | null; two_factor_enabled?: boolean;
    wilayah_id?: number | null; wilayah?: Wilayah;
    approved_konten_count: number;
    created_at: string; updated_at: string; roles?: Role[];
    [key: string]: unknown;
}
export interface Permission {
    id: number; name: string; label: string; guard_name: string;
    created_at: string; updated_at: string; [key: string]: unknown;
}
export interface Role {
    id: number; name: string; guard_name: string;
    created_at: string; updated_at: string; permissions?: Permission[];
}

// ---- Platform types ----
export type KontenStatus = 'pending' | 'published' | 'rejected';
export type MediaTipe = 'image' | 'video' | 'audio' | 'document';
export type WilayahTipe = 'kota' | 'kabupaten';
export type ModerasiAksi = 'approve' | 'reject' | 'user_revise' | 'user_decline';
export type KomentarStatus = 'aktif' | 'tersembunyi';

export interface KontenBudaya {
    id: number; user_id: number; category_id: number; wilayah_id: number;
    judul: string; slug: string; deskripsi: string; status: KontenStatus;
    catatan_admin: string | null; cover_url: string | null; view_count: number;
    approved_by: number | null; approved_at: string | null;
    created_at: string; updated_at: string;
    user?: User; category?: Category; wilayah?: Wilayah;
    media_files?: MediaFile[]; primary_media?: MediaFile | null;
    tags?: Tag[]; moderation_logs?: ModerationLog[]; comments_count?: number;
    comments?: Comment[];
    first_video?: MediaFile;
    ratings_count?: number;
    ratings_avg_skor?: number | null;
}
export interface Category {
    id: number; nama: string; slug: string; deskripsi: string | null;
    icon: string | null; parent_id: number | null; urutan: number;
    created_at: string; updated_at: string;
    parent?: Category; children?: Category[]; konten_budayas_count?: number;
}
export interface Wilayah {
    id: number; nama: string; tipe: WilayahTipe;
    created_at: string; updated_at: string; konten_budayas_count?: number;
}
export interface MediaFile {
    id: number; konten_id: number; tipe: MediaTipe; url: string; filename: string;
    mime_type: string; ukuran_kb: number; durasi_detik: number | null;
    thumbnail_url: string | null; is_primary: boolean; urutan: number; created_at: string;
}
export interface Tag {
    id: number; nama: string; slug: string; created_at: string; konten_budayas_count?: number;
}
export interface Comment {
    id: number; konten_id: number; user_id: number; parent_id: number | null;
    isi: string; status: KomentarStatus; created_at: string;
    user?: User; konten?: KontenBudaya; replies?: Comment[];
}
export interface ModerationLog {
    id: number; konten_id: number; user_id: number;
    aksi: ModerasiAksi; catatan: string | null; created_at: string; user?: User;
}
export interface PaginationLink { url: string | null; label: string; active: boolean; }
export interface Paginated<T> {
    data: T[]; links: PaginationLink[];
    current_page: number; last_page: number; per_page: number; total: number;
    from: number | null; to: number | null;
}
export interface Flash { success?: string; error?: string; }
