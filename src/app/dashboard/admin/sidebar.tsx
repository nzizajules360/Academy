
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookUser,
  Settings,
  Table,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/admin/students', icon: Users, label: 'Students' },
  { href: '/dashboard/admin/utilities', icon: ClipboardList, label: 'Utilities' },
  { href: '/dashboard/admin/materials', icon: BookUser, label: 'Materials' },
  { href: '/dashboard/admin/refectory', icon: Table, label: 'Refectory' },
  { href: '/dashboard/admin/reports', icon: FileText, label: 'Reports' },
  { href: '/dashboard/admin/settings/fees', icon: Settings, label: 'Fee Settings' },
  { href: '/dashboard/admin/settings/academic', icon: Calendar, label: 'Academic Settings' },
];

const BsmLogo = () => (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
      BSM
    </div>
  );

export function AdminSidebar() {
  const pathname = usePathname();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2" data-sidebar-menu-button="">
            <BsmLogo />
            <span className="text-lg font-semibold text-sidebar-foreground">BSM</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href.split('/').length === pathname.split('/').length || pathname.split('/').length === item.href.split('/').length+1)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
            <Badge variant="secondary" className="bg-white/20 text-white border-none">v1.0</Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
