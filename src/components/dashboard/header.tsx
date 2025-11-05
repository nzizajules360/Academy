'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/user-nav';
import { useRole } from '@/hooks/use-role';

export function DashboardHeader() {
  const { role } = useRole();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex-1">
        <h1 className="font-semibold text-lg capitalize">{role} Dashboard</h1>
      </div>
      <UserNav />
    </header>
  );
}
