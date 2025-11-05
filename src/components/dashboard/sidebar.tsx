'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookUser,
  ClipboardList,
  GraduationCap,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useRole } from '@/hooks/use-role';
import type { UserRole } from '@/types';

const navItems = {
  admin: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/students', icon: Users, label: 'Students' },
    { href: '/dashboard/utilities', icon: ClipboardList, label: 'Utilities' },
    { href: '/dashboard/materials', icon: BookUser, label: 'Materials' },
    { href: '/dashboard/daily-planner', icon: ListTodo, label: 'Daily Planner' },
  ],
  secretary: [
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

export function DashboardSidebar() {
  const { role, setRole } = useRole();
  const pathname = usePathname();
  const currentNavItems = navItems[role] || [];
  
  const createHref = (baseHref: string) => `${baseHref}?role=${role}`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2" data-sidebar-menu-button="">
            <GraduationCap className="w-8 h-8 text-sidebar-primary" />
            <span className="text-lg font-semibold text-sidebar-foreground">CampusConnect</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {currentNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={createHref(item.href)} legacyBehavior passHref>
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
        <div className="flex flex-col gap-2 p-2" data-sidebar-group>
            <Label className="px-2 text-xs font-medium text-sidebar-foreground/70" data-sidebar-group-label>Switch Role</Label>
            <div data-sidebar-group-content>
              <Select onValueChange={(value: UserRole) => setRole(value)} value={role}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground h-9">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="patron">Patron</SelectItem>
                  <SelectItem value="matron">Matron</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
