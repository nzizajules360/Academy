'use client';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

export const useActiveTerm = () => {
    const firestore = useFirestore();
    const appSettingsRef = firestore ? doc(firestore, 'settings', 'app') : null;
    const [appSettings, loading, error] = useDocumentData(appSettingsRef);

    return {
        activeTermId: appSettings?.activeTermId,
        loading,
        error
    };
};
