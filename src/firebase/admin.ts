
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

export function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return {
    auth: admin.auth(),
    firestore: admin.firestore(),
  };
}
