import { getAuth } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from './config';

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get auth instance
export const auth = getAuth(app);