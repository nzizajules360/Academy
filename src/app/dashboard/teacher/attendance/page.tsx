
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, ListChecks, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type AttendanceStatus = 'present' | 'absent';

export default function AttendancePage() {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();
  const { toast } = useToast();
  
  const [assignedClass, setAssignedClass] = useState<string | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [todayDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // 1. Fetch teacher's assigned class
  useEffect(() => {
    if (user && firestore) {
      const fetchAssignment = async () => {
        setLoadingAssignment(true);
        const q = query(collection(firestore, 'teacherAssignments'), where('teacherId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const assignment = querySnapshot.docs[0].data();
          setAssignedClass(assignment.class);
        }
        setLoadingAssignment(false);
      };
      fetchAssignment();
    }
  }, [user, firestore]);

  // 2. Fetch students for the assigned class and active term
  const studentsQuery = (firestore && activeTermId && assignedClass)
    ? query(
        collection(firestore, 'students'),
        where('termId', '==', activeTermId),
        where('class', '==', assignedClass)
      )
    : null;
  const [students, loadingStudents, errorStudents] = useCollectionData(studentsQuery, { idField: 'id' });

  // 3. Fetch today's attendance records to pre-fill the form
   useEffect(() => {
    if (students && firestore && activeTermId) {
      const fetchAttendance = async () => {
        const studentIds = students.map(s => s.id);
        if (studentIds.length === 0) return;

        const q = query(
          collection(firestore, 'attendanceRecords'),
          where('termId', '==', activeTermId),
          where('date', '==', todayDate),
          where('studentId', 'in', studentIds)
        );
        const querySnapshot = await getDocs(q);
        const existingAttendance: Record<string, AttendanceStatus> = {};
        querySnapshot.forEach(doc => {
          const record = doc.data();
          existingAttendance[record.studentId] = record.status;
        });
        setAttendance(existingAttendance);
      };
      fetchAttendance();
    }
  }, [students, firestore, activeTermId, todayDate]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!firestore || !students || !activeTermId || !assignedClass || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Missing required data to save.' });
        return;
    }
    setIsSaving(true);
    
    try {
        const batch = writeBatch(firestore);
        
        for (const student of students) {
            const studentId = student.id;
            const status = attendance[studentId];

            if (status) { // Only save if a status is selected
                const recordId = `${activeTermId}_${todayDate}_${studentId}`;
                const recordRef = doc(firestore, 'attendanceRecords', recordId);
                
                batch.set(recordRef, {
                    studentId,
                    studentName: student.name,
                    date: todayDate,
                    class: assignedClass,
                    termId: activeTermId,
                    status,
                    recordedBy: user.uid,
                    recordedAt: Timestamp.now(),
                });
            }
        }
        
        await batch.commit();
        toast.success({ title: 'Success', description: 'Attendance has been saved for today.' });
    } catch (error) {
        console.error("Error saving attendance: ", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save attendance records.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const allMarked = students && students.length > 0 && students.every(s => !!attendance[s.id]);
  const isLoading = loadingUser || loadingTerm || loadingAssignment || loadingStudents;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!assignedClass) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle />No Class Assigned</CardTitle>
          </CardHeader>
          <CardContent>
              <p>You have not been assigned to a class yet. Please contact an administrator.</p>
          </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <ListChecks className="h-6 w-6 text-primary" />
                    Class Attendance: {assignedClass}
                </CardTitle>
                <CardDescription className="text-base mt-1">Mark attendance for {format(new Date(), 'PPPP')}.</CardDescription>
            </div>
             <Button onClick={handleSaveAttendance} disabled={isSaving || !allMarked} className="w-full md:w-auto">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                Save Attendance
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {errorStudents && <p className="text-destructive p-6">Error loading students: {errorStudents.message}</p>}
        <AnimatePresence>
        {students && students.length === 0 && (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center text-muted-foreground p-16">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50"/>
                <h3 className="text-lg font-semibold">No Students in Class</h3>
                <p>No students found for class {assignedClass} in the active term.</p>
            </motion.div>
        )}
        </AnimatePresence>
        {students && students.length > 0 && (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="pl-6 w-[60%]">Student Name</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student, index) => (
                    <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t"
                    >
                        <TableCell className="font-medium pl-6">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {student.name}
                            </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                        <RadioGroup
                            value={attendance[student.id]}
                            onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                            className="flex justify-end gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="present" id={`${student.id}-present`} />
                                <Label htmlFor={`${student.id}-present`}>Present</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="absent" id={`${student.id}-absent`} className="border-destructive text-destructive" />
                                <Label htmlFor={`${student.id}-absent`}>Absent</Label>
                            </div>
                        </RadioGroup>
                        </TableCell>
                    </motion.tr>
                    ))}
                </TableBody>
            </Table>
        )}
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-primary/5 to-primary/10 border-t">
        <p className="text-xs text-muted-foreground">
            {allMarked ? 'All students have been marked.' : 'Please mark all students to save.'}
        </p>
      </CardFooter>
    </Card>
    </motion.div>
  );
}
