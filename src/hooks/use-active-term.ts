
'use client';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useEffect, useState } from 'react';
import { DocumentData } from 'firebase/firestore';

export const useActiveTerm = () => {
    const firestore = useFirestore();
    const appSettingsRef = firestore ? doc(firestore, 'settings', 'app') : null;
    const [appSettings, loadingSettings, errorSettings] = useDocumentData(appSettingsRef);
    const [activeTerm, setActiveTerm] = useState<DocumentData | null>(null);
    const [loadingTerm, setLoadingTerm] = useState(true);

    const activeTermId = appSettings?.activeTermId;

    useEffect(() => {
        if (!firestore || !activeTermId) {
            setLoadingTerm(false);
            setActiveTerm(null);
            return;
        }

        const fetchTerm = async () => {
            setLoadingTerm(true);
            const [yearId, termId] = activeTermId.split('_');
            if (!yearId || !termId) {
                setActiveTerm(null);
                setLoadingTerm(false);
                return;
            }
            const termRef = doc(firestore, 'academicYears', yearId, 'terms', termId);
            const termSnap = await getDoc(termRef);
            if (termSnap.exists()) {
                setActiveTerm({ id: termSnap.id, ...termSnap.data() });
            } else {
                setActiveTerm(null);
            }
            setLoadingTerm(false);
        };

        fetchTerm();
    }, [firestore, activeTermId]);

    return {
        activeTermId: activeTermId,
        activeTerm,
        loading: loadingSettings || loadingTerm,
        error: errorSettings,
    };
};
