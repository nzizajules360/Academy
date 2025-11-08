import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';

// Helper to request notification permission and get FCM token
export async function requestNotificationPermissionAndGetToken({
  firebaseApp,
  vapidKey,
  serviceWorkerPath = '/firebase-messaging-sw.js',
}: {
  firebaseApp: FirebaseApp;
  vapidKey?: string | null;
  serviceWorkerPath?: string;
}): Promise<string | null> {
  if (!('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  // register service worker
  const registration = await navigator.serviceWorker.register(serviceWorkerPath);

  const messaging = getMessaging(firebaseApp);
  try {
    const token = await getToken(messaging, { vapidKey: vapidKey ?? undefined, serviceWorkerRegistration: registration });
    return token || null;
  } catch (e) {
    console.error('Error getting FCM token', e);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(firebaseApp: FirebaseApp, callback: (payload: any) => void) {
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, callback);
}
