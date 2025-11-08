importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// Replace these values with your project's config if different. These are loaded from the app's firebase config.
firebase.initializeApp({
  apiKey: "AIzaSyCLo7S28vJQSVt1kUhVLo8GzdAi4hKKImY",
  authDomain: "studio-6396400592-ed48d.firebaseapp.com",
  projectId: "studio-6396400592-ed48d",
  storageBucket: "studio-6396400592-ed48d.firebasestorage.app",
  messagingSenderId: "214145373804",
  appId: "1:214145373804:web:dcc1d02753050444ab2a49"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
