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
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser');
  }

  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported in this browser');
  }

  // First check if we already have permission
  if (Notification.permission === 'denied') {
    throw new Error('Notification permission was previously denied');
  }

  // If permission is already granted, we can proceed
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }
  }

  // Register or get existing service worker
  let registration;
  try {
    registration = await navigator.serviceWorker.register(serviceWorkerPath);
    await navigator.serviceWorker.ready;
  } catch (e) {
    throw new Error('Failed to register service worker');
  }

  // Get FCM token using the registered service worker
  const messaging = getMessaging(firebaseApp);
  try {
    const token = await getToken(messaging, { vapidKey: vapidKey ?? undefined, serviceWorkerRegistration: registration });
    return token || null;
  } catch (err) {
    console.error('Error getting FCM token', err);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(firebaseApp: FirebaseApp, callback: (payload: any) => void) {
  const messaging = getMessaging(firebaseApp);
  return onMessage(messaging, callback);
}
