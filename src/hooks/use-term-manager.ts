
'use client';
import { useFirestore } from '@/firebase';
import { collection, query, where, doc, getDoc, DocumentData } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from './use-active-term';
import type { EnrolledStudent } from '@/types/refectory';

export const useTermManager = () => {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm, activeTerm } = useActiveTerm();

    const studentsQuery = (firestore && activeTermId) 
        ? query(collection(firestore, 'students'), where('termId', '==', activeTermId))
        : null;

    const [students, loadingStudents, error] = useCollectionData(studentsQuery, { idField: 'id' });

    const enrolledStudents: EnrolledStudent[] | undefined = students?.map(s => ({
        id: s.id,
        fullName: s.name,
        gender: s.gender,
        class: s.class,
    }));

    return {
        enrolledStudents,
        loading: loadingTerm || loadingStudents,
        error,
        activeTerm,
    };
};
