import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

export function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return {
    auth: admin.auth(),
    firestore: admin.firestore(),
  };
}