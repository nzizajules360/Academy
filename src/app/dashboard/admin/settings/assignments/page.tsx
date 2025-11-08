
'use client';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, User, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const classes = [
    'S1', 'S2', 'S3', 'S4 ACC', 'S5 ACC', 'S6 ACC',
    'L3 SWD', 'L4 SWD', 'L5 SWD'
];

interface Teacher {
    uid: string;
    displayName: string;
    email: string;
    assignmentId?: string;
    assignedClass?: string;
}

export default function TeacherAssignmentsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!firestore) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all users who are teachers
                const teachersQuery = query(collection(firestore, 'users'), where('role', '==', 'teacher'));
                const teachersSnapshot = await getDocs(teachersQuery);
                const teacherData = teachersSnapshot.docs.map(d => ({ uid: d.id, ...d.data() })) as Omit<Teacher, 'assignmentId' | 'assignedClass'>[];

                // Fetch all current assignments
                const assignmentsSnapshot = await getDocs(collection(firestore, 'teacherAssignments'));
                const assignmentsMap = new Map<string, { id: string, class: string }>();
                assignmentsSnapshot.forEach(doc => {
                    const data = doc.data();
                    assignmentsMap.set(data.teacherId, { id: doc.id, class: data.class });
                });

                // Combine teacher data with their assignments
                const enrichedTeachers = teacherData.map(teacher => {
                    const assignment = assignmentsMap.get(teacher.uid);
                    return {
                        ...teacher,
                        assignmentId: assignment?.id,
                        assignedClass: assignment?.class,
                    };
                });

                setTeachers(enrichedTeachers);
            } catch (error) {
                console.error("Error fetching data: ", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load teacher or assignment data.' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [firestore, toast]);

    const handleClassChange = (teacherId: string, newClass: string) => {
        setTeachers(currentTeachers =>
            currentTeachers.map(t =>
                t.uid === teacherId ? { ...t, assignedClass: newClass } : t
            )
        );
    };

    const handleSaveAssignment = async (teacherId: string) => {
        if (!firestore) return;

        const teacher = teachers.find(t => t.uid === teacherId);
        if (!teacher || !teacher.assignedClass) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot save. No class selected.' });
            return;
        }

        setIsSaving(prev => ({ ...prev, [teacherId]: true }));
        try {
            const assignmentData = {
                teacherId: teacher.uid,
                class: teacher.assignedClass,
            };

            if (teacher.assignmentId) {
                // Update existing assignment
                const assignmentRef = doc(firestore, 'teacherAssignments', teacher.assignmentId);
                await setDoc(assignmentRef, assignmentData, { merge: true });
            } else {
                // Create new assignment
                const newDocRef = await addDoc(collection(firestore, 'teacherAssignments'), assignmentData);
                // Update local state with new assignment ID to allow for future updates
                setTeachers(currentTeachers =>
                    currentTeachers.map(t =>
                        t.uid === teacherId ? { ...t, assignmentId: newDocRef.id } : t
                    )
                );
            }

            toast({ title: 'Success', description: `Assignment for ${teacher.displayName} saved successfully.` });
        } catch (error) {
            console.error("Error saving assignment: ", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the assignment.' });
        } finally {
            setIsSaving(prev => ({ ...prev, [teacherId]: false }));
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <Book className="h-6 w-6 text-primary" />
                        Teacher Assignments
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                        Assign teachers to their respective classes for the academic year.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6 font-semibold text-base">Teacher</TableHead>
                                    <TableHead className="font-semibold text-base">Assigned Class</TableHead>
                                    <TableHead className="text-right pr-6 font-semibold text-base">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.map((teacher, index) => (
                                    <motion.tr
                                        key={teacher.uid}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-t"
                                    >
                                        <TableCell className="font-medium pl-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{teacher.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{teacher.displayName}</p>
                                                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={teacher.assignedClass || ''}
                                                onValueChange={(value) => handleClassChange(teacher.uid, value)}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select a class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(c => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSaveAssignment(teacher.uid)}
                                                disabled={isSaving[teacher.uid] || !teacher.assignedClass}
                                            >
                                                {isSaving[teacher.uid] ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                Save
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
