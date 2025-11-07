'use client';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

export const useActiveTerm = () => {
    const firestore = useFirestore();
    const appSettingsRef = firestore ? doc(firestore, 'settings', 'app') : null;
    const [appSettings, loading, error] = useDocumentData(appSettingsRef);

    const activeTermId = appSettings?.activeTermId;

    return {
        activeTermId: activeTermId,
        loading,
        error
    };
};
