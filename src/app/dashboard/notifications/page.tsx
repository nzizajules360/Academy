
'use client';

import { useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, writeBatch, getDocs, where } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, CheckCheck, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

export default function NotificationsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const notificationsQuery = (user && firestore)
        ? query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'))
        : null;
    
    const [notifications, loading, error] = useCollectionData(notificationsQuery, { idField: 'id' });

    const unreadNotifications = notifications?.filter(n => !n.read) || [];
    const readNotifications = notifications?.filter(n => n.read) || [];

    const handleMarkAllAsRead = async () => {
        if (!firestore || !user) return;

        const unreadIds = (notifications?.filter(n => !n.read) || []).map(n => n.id);
        
        if (unreadIds.length === 0) {
             toast({
                title: 'No Unread Notifications',
                description: 'Everything is already up to date!',
            });
            return;
        }

        const batch = writeBatch(firestore);
        try {
            const notificationsRef = collection(firestore, `users/${user.uid}/notifications`);
            // Firestore 'in' queries are limited to 30 items. If more, we need multiple batches.
            for (let i = 0; i < unreadIds.length; i += 30) {
                const chunkIds = unreadIds.slice(i, i + 30);
                if (chunkIds.length > 0) {
                    const q = query(notificationsRef, where('__name__', 'in', chunkIds));
                    const snapshot = await getDocs(q);
                    snapshot.forEach(doc => {
                        batch.update(doc.ref, { read: true });
                    });
                }
            }

            await batch.commit();
            toast({
                title: 'Success',
                description: 'All notifications marked as read.',
                variant: 'success'
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
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
    }

    if (error) {
        return (
            <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2"><AlertCircle /> Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not load notifications: {error.message}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                <Bell className="h-6 w-6 text-primary" />
                                Notifications
                            </CardTitle>
                            <CardDescription className="text-base mt-1">A log of all your system notifications.</CardDescription>
                        </div>
                        <Button onClick={handleMarkAllAsRead} disabled={unreadNotifications.length === 0}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {notifications && notifications.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold">No notifications yet</h3>
                            <p>You have no notifications or events.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {unreadNotifications.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-semibold mb-4 text-primary">Unread</h3>
                                    <div className="space-y-4">
                                        {unreadNotifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                                    </div>
                                </section>
                            )}

                             {unreadNotifications.length > 0 && readNotifications.length > 0 && <Separator />}

                             {readNotifications.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-semibold mb-4">Recent</h3>
                                     <div className="space-y-4">
                                        {readNotifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                                    </div>
                                </section>
                             )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}


function NotificationItem({ notification }: { notification: any }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-lg flex items-start gap-4 transition-colors ${!notification.read ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}
        >
            {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
            <div className={notification.read ? 'pl-7' : ''}>
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.body}</p>
                <p className="text-xs text-muted-foreground mt-2">
                     {notification.createdAt && (notification.createdAt as Timestamp).toDate ? 
                        formatDistanceToNow((notification.createdAt as Timestamp).toDate(), { addSuffix: true }) : ''}
                </p>
            </div>
        </motion.div>
    )
}
