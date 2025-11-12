'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
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

const navItems = [
  { href: '/dashboard/developer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/developer/settings', icon: Settings, label: 'Settings' },
];

export function DeveloperSidebar() {
  const pathname = usePathname();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2" data-sidebar-menu-button="">
            <ShieldCheck className="h-7 w-7 text-sidebar-primary-foreground" />
            <span className="text-lg font-semibold text-sidebar-foreground">Developer</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
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
