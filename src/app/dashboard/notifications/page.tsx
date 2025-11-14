'use client';

import { useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, writeBatch, doc, getDocs, where } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, CheckCheck, AlertCircle, Inbox, Trash2, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function NotificationItem({ notification }: { notification: any }) {
    const getNotificationIcon = (type?: string) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'warning':
                return '⚠';
            case 'error':
                return '✕';
            default:
                return '🔔';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className={`group relative p-5 rounded-xl flex items-start gap-4 transition-all duration-300 hover:shadow-md ${
                !notification.read 
                    ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary shadow-sm' 
                    : 'bg-muted/20 hover:bg-muted/30'
            }`}
        >
            {/* Notification Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                !notification.read 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
            }`}>
                {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-base leading-tight ${
                        !notification.read ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                        {notification.title}
                    </h4>
                    {!notification.read && (
                        <Badge variant="default" className="ml-2 text-xs px-2 py-0 h-5">
                            New
                        </Badge>
                    )}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {notification.body}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                        {notification.createdAt && (notification.createdAt as Timestamp).toDate ? 
                            formatDistanceToNow((notification.createdAt as Timestamp).toDate(), { addSuffix: true }) 
                            : 'Recently'}
                    </span>
                    {notification.category && (
                        <span className="px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                            {notification.category}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    <Archive className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
}

export default function NotificationsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const notificationsQuery = (user && firestore)
        ? query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'))
        : null;
    
    const [notifications, loading, error] = useCollectionData(notificationsQuery, { idField: 'id' });

    const handleMarkAllAsRead = async () => {
        if (!firestore || !user) return;
        
        const unreadQuery = query(
            collection(firestore, `users/${user.uid}/notifications`), 
            where('read', '==', false)
        );
        const unreadSnapshot = await getDocs(unreadQuery);

        if (unreadSnapshot.empty) {
            toast({
                title: 'All Caught Up!',
                description: 'You have no unread notifications.',
            });
            return;
        }

        try {
            const batch = writeBatch(firestore);
            unreadSnapshot.forEach(docSnap => {
                batch.update(docSnap.ref, { read: true });
            });
            
            await batch.commit();
            toast({
                title: 'Success',
                description: `Marked ${unreadSnapshot.size} notifications as read.`,
            });
        } catch (err) {
            console.error(err);
            toast({
                title: 'Error',
                description: 'Could not mark notifications as read.',
                variant: 'destructive'
            });
        }
    };
    
    if (loading || userLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card className="bg-destructive/10 border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" /> 
                            Error Loading Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    const unreadNotifications = notifications?.filter(n => !n.read) || [];
    const readNotifications = notifications?.filter(n => n.read) || [];
    const totalUnread = unreadNotifications.length;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-5xl mx-auto"
        >
            <Card className="bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-lg border-border/50 shadow-2xl overflow-hidden">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                                    <div className="relative">
                                        <Bell className="h-7 w-7 text-primary" />
                                        {totalUnread > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold"
                                            >
                                                {totalUnread}
                                            </motion.div>
                                        )}
                                    </div>
                                    Notifications
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {totalUnread > 0 
                                        ? `You have ${totalUnread} unread notification${totalUnread !== 1 ? 's' : ''}`
                                        : 'All caught up! No new notifications.'}
                                </CardDescription>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleMarkAllAsRead} 
                                    disabled={totalUnread === 0}
                                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                                    variant={totalUnread > 0 ? "default" : "secondary"}
                                >
                                    <CheckCheck className="mr-2 h-4 w-4" />
                                    Mark all read
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </div>

                <CardContent className="p-6">
                    {notifications && notifications.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center py-20 text-muted-foreground"
                        >
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
                                <Inbox className="relative h-20 w-20 mx-auto mb-6 opacity-30" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Notifications Yet</h3>
                            <p className="text-sm max-w-sm mx-auto">
                                When you receive notifications, they'll appear here for easy access.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-8">
                            {/* Unread Section */}
                            <AnimatePresence>
                                {unreadNotifications.length > 0 && (
                                    <motion.section
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <h3 className="text-lg font-bold text-primary">
                                                Unread
                                            </h3>
                                            <Badge variant="secondary" className="text-xs">
                                                {unreadNotifications.length}
                                            </Badge>
                                        </div>
                                        <div className="space-y-3">
                                            {unreadNotifications.map((n, index) => (
                                                <NotificationItem 
                                                    key={n.id} 
                                                    notification={n} 
                                                />
                                            ))}
                                        </div>
                                    </motion.section>
                                )}
                            </AnimatePresence>

                            {/* Separator */}
                            {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                                <div className="relative">
                                    <Separator className="bg-border/50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="bg-card px-3 text-xs text-muted-foreground font-medium">
                                            Earlier
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Read Section */}
                            {readNotifications.length > 0 && (
                                <motion.section
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center gap-3 mb-5">
                                        <h3 className="text-lg font-semibold text-muted-foreground">
                                            Recent
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {readNotifications.length} notification{readNotifications.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {readNotifications.map((n, index) => (
                                            <NotificationItem 
                                                key={n.id} 
                                                notification={n} 
                                            />
                                        ))}
                                    </div>
                                </motion.section>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}