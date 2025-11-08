import { getMessaging, getToken } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';

export async function sendPaymentNotification({
  firestore,
  title,
  body,
  userId,
  tokenId
}: {
  firestore: Firestore;
  title: string;
  body: string;
  userId: string;
  tokenId: string;
}) {
  // Save the notification to Firestore for delivery
  const notificationRef = doc(firestore, `users/${userId}/notifications/${Date.now()}`);
  await setDoc(notificationRef, {
    title,
    body,
    timestamp: new Date(),
    type: 'payment',
    read: false,
    tokenId
  });
}

export async function checkAndNotifyPaymentDeadline({
  firestore,
  firebaseApp,
  userId,
  deadline,
  studentsWithOutstandingFees
}: {
  firestore: Firestore;
  firebaseApp: FirebaseApp;
  userId: string;
  deadline: string;
  studentsWithOutstandingFees: number;
}) {
  if (!firestore || !firebaseApp || !userId) return;

  const messaging = getMessaging(firebaseApp);
  const token = await getToken(messaging);
  if (!token) return;

  // Create notification content
  const title = 'Payment Deadline Alert';
  const body = `${studentsWithOutstandingFees} student${studentsWithOutstandingFees > 1 ? 's have' : ' has'} outstanding fees past the deadline (${new Date(deadline).toLocaleDateString()}).`;

  // Send the notification
  await sendPaymentNotification({
    firestore,
    title,
    body,
    userId,
    tokenId: token
  });
}