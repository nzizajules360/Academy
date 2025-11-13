'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/user-nav';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter,
} from '@/components/ui/dropdown-menu';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit, writeBatch, getDocs, Timestamp } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';


const NotificationBell = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = (user && firestore)
        ? query(
            collection(firestore, `users/${user.uid}/notifications`),
            orderBy('createdAt', 'desc'),
            limit(5)
        ) : null;
    
    const [notifications, loading] = useCollectionData(notificationsQuery, { idField: 'id' });

    const unreadNotificationsQuery = (user && firestore) 
        ? query(collection(firestore, `users/${user.uid}/notifications`), where('read', '==', false))
        : null;
    const [unreadNotifications] = useCollectionData(unreadNotificationsQuery);
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-primary/5">
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                    {unreadNotifications && unreadNotifications.length > 0 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold"
                        >
                            {unreadNotifications.length}
                        </motion.div>
                    )}
                    </AnimatePresence>
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Recent Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loading && <DropdownMenuItem>Loading...</DropdownMenuItem>}
                {!loading && notifications?.length === 0 && <DropdownMenuItem>No new notifications</DropdownMenuItem>}
                {notifications?.map(n => (
                    <DropdownMenuItem key={n.id} className={`flex items-start gap-3 ${!n.read ? 'bg-accent/50' : ''}`}>
                         {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                         <div className={n.read ? 'pl-5' : ''}>
                            <p className="font-semibold">{n.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {n.createdAt && (n.createdAt as Timestamp).toDate ? formatDistanceToNow((n.createdAt as Timestamp).toDate(), { addSuffix: true }) : ''}
                            </p>
                         </div>
                    </DropdownMenuItem>
                ))}
                 <DropdownMenuSeparator />
                 <DropdownMenuFooter>
                    <Button variant="ghost" className="w-full" asChild>
                        <Link href="/dashboard/activity">View all activity</Link>
                    </Button>
                 </DropdownMenuFooter>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


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
             <NotificationBell />
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
