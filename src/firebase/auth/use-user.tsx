'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

interface AppUser extends User {
  role?: string;
}

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth || !firestore) {
        setLoading(false);
        return;
    };

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            const userDocRef = doc(firestore as Firestore, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUser({ ...firebaseUser, ...userDoc.data() });
            } else {
              setUser(firebaseUser); // User exists in Auth but not Firestore
            }
          } catch (e) {
            setError(e instanceof Error ? e : new Error('An unknown error occurred'));
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading, error };
};
