'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookUser,
  ClipboardList,
  LayoutDashboard,
  Users,
  Settings,
  Table,
  FileText,
  ListChecks,
  Send,
  BedDouble,
  BookCheck,
  ShieldCheck,
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

const navItems: Record<string, { href: string; icon: React.ElementType; label: string }[]> = {
  admin: [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/admin/students', icon: Users, label: 'Students' },
    { href: '/dashboard/admin/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/admin/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/admin/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/admin/reports', icon: FileText, label: 'Reports' },
    { href: '/dashboard/admin/settings', icon: Settings, label: 'Settings' },
  ],
  secretary: [
    { href: '/dashboard/secretary', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/secretary/students', icon: Users, label: 'Manage Students' },
    { href: '/dashboard/secretary/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/secretary/reports', icon: FileText, label: 'Reports' },
    { href: '/dashboard/secretary/settings', icon: Settings, label: 'Settings' },
  ],
  patron: [
    { href: '/dashboard/patron', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/patron/students', icon: Users, label: 'Students' },
    { href: '/dashboard/patron/dormitory', icon: BedDouble, label: 'Dormitory' },
    { href: '/dashboard/patron/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/patron/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/patron/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/patron/reports', icon: FileText, label: 'Reports' },
  ],
  matron: [
    { href: '/dashboard/matron', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/matron/students', icon: Users, label: 'Students' },
    { href: '/dashboard/matron/dormitory', icon: BedDouble, label: 'Dormitory' },
    { href: '/dashboard/matron/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/matron/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/matron/refectory', icon: Table, label: 'Refectory' },
    { href: '/dashboard/matron/reports', icon: FileText, label: 'Reports' },
  ],
  teacher: [
    { href: '/dashboard/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/teacher/attendance', icon: ListChecks, label: 'Daily Attendance' },
    { href: '/dashboard/teacher/attendance/report', icon: BookCheck, label: 'Attendance Report' },
    { href: '/dashboard/teacher/lists', icon: Send, label: 'Received Lists' },
  ],
  developer: [
    { href: '/dashboard/developer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/developer/settings', icon: Settings, label: 'Settings' },
  ]
};

const BsmLogo = () => (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
      BSM
    </div>
  );

export function DashboardSidebar() {
  const { user } = useUser();
  const role = user?.role as UserRole | 'developer' | undefined ?? 'admin';
  const pathname = usePathname();
  const currentNavItems = navItems[role] || [];
  const SidebarIcon = role === 'developer' ? ShieldCheck : BsmLogo;
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2" data-sidebar-menu-button="">
            <SidebarIcon />
            <span className="text-lg font-semibold text-sidebar-foreground capitalize">{role === 'developer' ? 'Developer' : 'BSM'}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {currentNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
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