import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, CheckSquare, FileText, FolderOpen, KeyIcon, LayoutGrid, MapPin, MessageSquare, Tag, Upload, User } from 'lucide-react';
import AppLogo from './app-logo';
import users from '@/routes/users';
import roles from '@/routes/roles';
import { dashboard } from '@/routes';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
];

const kontribusiItems: NavItem[] = [
    { title: 'Konten Saya', href: '/kontribusi', icon: BookOpen },
    { title: 'Upload Konten', href: '/kontribusi/create', icon: Upload },
];

const adminKontenItems: NavItem[] = [
    { title: 'Semua Konten',  href: '/konten',   icon: CheckSquare,    permissions: ['konten index'] },
    { title: 'Komentar',      href: '/komentar', icon: MessageSquare,  permissions: ['komentar index'] },
];

const adminDataItems: NavItem[] = [
    { title: 'Kategori', href: '/kategori', icon: FolderOpen, permissions: ['kategori index'] },
    { title: 'Wilayah',  href: '/wilayah',  icon: MapPin,     permissions: ['wilayah index'] },
    { title: 'Tag',      href: '/tag',      icon: Tag,        permissions: ['tag index'] },
];

const adminHalamanItems: NavItem[] = [
    { title: 'Manajemen Halaman', href: '/halaman', icon: FileText, permissions: ['halaman index'] },
];

const userManagementItems: NavItem[] = [
    { title: 'Users', href: users.index(), icon: User,     permissions: ['users index'] },
    { title: 'Roles', href: roles.index(), icon: KeyIcon,  permissions: ['roles index'] },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain section="Platform"     items={mainNavItems} />
                <NavMain section="Kontribusi"   items={kontribusiItems} />
                <NavMain section="Moderasi"     items={adminKontenItems} />
                <NavMain section="Data Master"  items={adminDataItems} />
                <NavMain section="Halaman"      items={adminHalamanItems} />
                <NavMain section="Manajemen"    items={userManagementItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
