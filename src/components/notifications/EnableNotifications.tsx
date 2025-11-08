'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebaseApp, useFirestore } from '@/firebase';
import { requestNotificationPermissionAndGetToken, onForegroundMessage } from '@/firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '@/firebase';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EnableNotifications() {
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsub: any;
    if (firebaseApp && user) {
      // listen for foreground messages and show a toast
      unsub = onForegroundMessage(firebaseApp, (payload) => {
        toast({ title: payload.notification?.title || 'Notification', description: payload.notification?.body || '' });
      });
    }
    return () => unsub && unsub();
  }, [firebaseApp, user]);

  const handleEnable = async () => {
    if (!firebaseApp) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase not initialized.' });
      return;
    }
    if (!user) {
      toast({ variant: 'destructive', title: 'Sign in required', description: 'Please sign in to enable notifications.' });
      return;
    }

    setLoading(true);
    try {
      const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? null;
      const token = await requestNotificationPermissionAndGetToken({ firebaseApp, vapidKey });
      if (!token) {
        toast({ variant: 'destructive', title: 'Permission denied', description: 'Notification permission not granted.' });
        setLoading(false);
        return;
      }

      // Save token to Firestore under users/<uid>/fcmTokens/<token> or a collection deviceTokens
      if (firestore) {
        const tokenRef = doc(firestore, `users/${user.uid}/fcmTokens`, token);
        await setDoc(tokenRef, { token, createdAt: new Date() });
      }

      setEnabled(true);
      toast({ title: 'Notifications enabled', description: 'You will receive notifications on this device.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not enable notifications.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="icon" variant={enabled ? 'default' : 'ghost'} onClick={handleEnable} disabled={loading} title="Enable notifications">
      <Bell className="h-4 w-4" />
    </Button>
  );
}
