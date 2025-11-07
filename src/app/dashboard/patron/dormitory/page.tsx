
'use client';

import { useFirestore } from '@/firebase';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BedDouble } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function DormitoryPage() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(
        collection(firestore, 'students'),
        where('termId', '==', activeTermId),
        where('gender', '==', 'male')
    ) : null;

    const [students, loadingStudents] = useCollectionData(studentsQuery);

    const beds = (students || [])
      .filter(student => student.dormitoryBed != null)
      .reduce((acc, student) => {
        const bedNumber = student.dormitoryBed;
        if (!acc[bedNumber]) {
            acc[bedNumber] = [];
        }
        acc[bedNumber].push(student);
        return acc;
    }, {} as Record<number, DocumentData[]>);

    const sortedBeds = Object.entries(beds).sort(([a], [b]) => Number(a) - Number(b));

    const isLoading = loadingTerm || loadingStudents;

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Male Dormitory Overview
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    View bed assignments for all male students in the active term.
                </p>
            </div>

            {sortedBeds.length === 0 ? (
                 <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                    <CardContent className="p-16 text-center text-muted-foreground">
                         <BedDouble className="mx-auto h-12 w-12 mb-4 opacity-50"/>
                        <h3 className="text-lg font-semibold">No Beds Assigned</h3>
                        <p>No male students have been assigned to a dormitory bed for the active term.</p>
                    </CardContent>
                 </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedBeds.map(([bedNumber, assignedStudents], index) => (
                        <motion.div
                            key={bedNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                                <CardHeader className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-b">
                                    <CardTitle className="flex items-center gap-3">
                                        <BedDouble className="h-6 w-6 text-blue-500"/>
                                        Bed #{bedNumber}
                                    </CardTitle>
                                    <CardDescription>
                                        <Badge variant={assignedStudents.length === 2 ? "default" : "secondary"}>
                                            {assignedStudents.length} / 2 Occupants
                                        </Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {assignedStudents.map((s) => (
                                         <div key={s.id} className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{s.name}</p>
                                                <p className="text-sm text-muted-foreground">{s.class}</p>
                                            </div>
                                         </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
