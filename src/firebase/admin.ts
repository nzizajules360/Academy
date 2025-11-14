
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Ensure environment variables are loaded
require('dotenv').config();

let adminApp: admin.app.App | undefined;

export function initAdmin() {
  if (getApps().length > 0) {
    if (!adminApp) {
      adminApp = getApps()[0] as admin.app.App;
    }
    return {
      auth: admin.auth(adminApp),
      firestore: admin.firestore(adminApp),
      storage: admin.storage(adminApp),
      messaging: admin.messaging(adminApp),
      app: adminApp
    };
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });

     return {
      auth: admin.auth(adminApp),
      firestore: admin.firestore(adminApp),
      storage: admin.storage(adminApp),
      messaging: admin.messaging(adminApp),
      app: adminApp
    };
  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
    // Return null or partial object so the caller can handle the failure
    return { auth: null, firestore: null, storage: null, messaging: null, app: null };
  }
}
