'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookUser,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  Users,
  UserPlus,
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
import { useUser } from '@/firebase';
import type { UserRole } from '@/types';

const navItems: Record<UserRole, { href: string; icon: React.ElementType; label: string }[]> = {
  admin: [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/admin/students', icon: Users, label: 'Students' },
    { href: '/dashboard/admin/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/admin/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/admin/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/admin/reports', icon: FileText, label: 'Reports' },
    { href: '/dashboard/admin/daily-planner', icon: ListTodo, label: 'Daily Planner' },
    { href: '/dashboard/admin/settings/fees', icon: Settings, label: 'Fee Settings' },
    { href: '/dashboard/admin/settings/academic', icon: Calendar, label: 'Academic Settings' },
  ],
  secretary: [
    { href: '/dashboard/secretary', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/secretary/students', icon: Users, label: 'Manage Students' },
    { href: '/dashboard/secretary/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/secretary/reports', icon: FileText, label: 'Reports' },
    { href: '/dashboard/secretary/settings/fees', icon: Settings, label: 'Fee Settings' },
    { href: '/dashboard/secretary/settings/academic', icon: Calendar, label: 'Academic Settings' },
  ],
  patron: [
    { href: '/dashboard/patron', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/patron/students', icon: Users, label: 'Students' },
    { href: '/dashboard/patron/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/patron/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/patron/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/patron/reports', icon: FileText, label: 'Reports' },
    { href: '/dashboard/patron/class-activity-planner', icon: ListTodo, label: 'Class Activity Planner' },
  ],
  matron: [
    { href: '/dashboard/matron', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/matron/students', icon: Users, label: 'Students' },
    { href: '/dashboard/matron/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/matron/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/matron/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/matron/reports', icon: FileText, label: 'Reports' },
    { href: '/dashboard/matron/class-activity-planner', icon: ListTodo, label: 'Class Activity Planner' },
  ],
};

const BsmLogo = () => (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
      BSM
    </div>
  );

export function DashboardSidebar() {
  const { user } = useUser();
  const role = user?.role as UserRole | undefined ?? 'admin';
  const pathname = usePathname();
  const currentNavItems = navItems[role] || [];
  
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
          {currentNavItems.map((item) => (
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
