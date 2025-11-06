'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookUser,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  Users,
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
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/students', icon: Users, label: 'Students' },
    { href: '/dashboard/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/daily-planner', icon: ListTodo, label: 'Daily Planner' },
  ],
  secretary: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/students', icon: Users, label: 'Students' },
  ],
  patron: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/daily-planner', icon: ListTodo, label: 'Daily Planner' },
  ],
  matron: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/daily-planner', icon: ListTodo, label: 'Daily Planner' },
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
  
  const createHref = (baseHref: string) => `${baseHref}`;

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
              <Link href={createHref(item.href)}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
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
