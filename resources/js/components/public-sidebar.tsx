import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Compass, FolderOpen, Home, Info, LayoutGrid, Mail, MapPin, Upload } from 'lucide-react';

interface NavLink { title: string; href: string; icon: React.ElementType }

const utama: NavLink[] = [
    { title: 'Beranda', href: '/', icon: Home },
    // { title: 'Jelajah', href: '/galeri', icon: Compass },
    // { title: 'Kategori', href: '/galeri?view=kategori', icon: LayoutGrid },
    // { title: 'Wilayah', href: '/galeri?view=wilayah', icon: MapPin },
];

const kontribusi: NavLink[] = [
    { title: 'Upload Konten', href: '/kontribusi/create', icon: Upload },
    { title: 'Konten Saya', href: '/kontribusi', icon: FolderOpen },
];

const institusional: NavLink[] = [
    { title: 'Tentang Kami', href: '/tentang-kami', icon: Info },
    { title: 'Kontak', href: '/kontak', icon: Mail },
];

export function PublicSidebar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    const isActive = (href: string) => {
        const path = href.split('?')[0];
        return path === '/' ? page.url === '/' : page.url.startsWith(path);
    };

    const renderItems = (items: NavLink[]) =>
        items.map((item) => (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={{ children: item.title }}>
                    <Link href={item.href} prefetch>
                        <item.icon />
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ));

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#c2410c] font-bold text-white">
                                    B
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Budaya Sumsel</span>
                                    <span className="truncate text-xs text-muted-foreground">Arsip Budaya Digital</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarMenu>{renderItems(utama)}</SidebarMenu>
                </SidebarGroup>

                {auth?.user && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Kontribusi</SidebarGroupLabel>
                        <SidebarMenu>{renderItems(kontribusi)}</SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>{renderItems(institusional)}</SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
