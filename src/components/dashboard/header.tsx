'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/user-nav';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';


export function DashboardHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-sm border-b border-border/40 bg-background/80">
      <div className="container mx-auto">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <SidebarTrigger className="sm:hidden" />
          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="h-5 w-px bg-border/50" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-primary/5"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="h-5 w-px bg-border/50" />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
