
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListChecks,
  Send,
  BookCheck,
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
  { href: '/dashboard/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/teacher/attendance', icon: ListChecks, label: 'Daily Attendance' },
  { href: '/dashboard/teacher/attendance/report', icon: BookCheck, label: 'Attendance Report' },
  { href: '/dashboard/teacher/lists', icon: Send, label: 'Received Lists' },
];

const BsmLogo = () => (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold text-xs">
      BSM
    </div>
  );

export function TeacherSidebar() {
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
                isActive={pathname === item.href || (item.href.includes('attendance') && pathname.startsWith(item.href) && item.href !== '/dashboard/teacher/attendance/report' && pathname !== '/dashboard/teacher/attendance/report') || (pathname === item.href) }
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
