
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, query, where, getDocs, writeBatch, Timestamp, DocumentData } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, ListChecks, Users, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type AttendanceStatus = 'present' | 'absent' | 'unset';
type StudentWithAttendance = DocumentData & { id: string; attendance: AttendanceStatus };

export default function AttendancePage() {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();
  const { toast } = useToast();
  
  const [assignedClass, setAssignedClass] = useState<string | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [studentsWithAttendance, setStudentsWithAttendance] = useState<StudentWithAttendance[]>([]);
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
        } else {
            setAssignedClass(null);
        }
        setLoadingAssignment(false);
      };
      fetchAssignment();
    } else if (!loadingUser) {
        setLoadingAssignment(false);
    }
  }, [user, firestore, loadingUser]);

  // 2. Fetch students for the assigned class and active term
  const studentsQuery = (firestore && activeTermId && assignedClass)
    ? query(
        collection(firestore, 'students'),
        where('termId', '==', activeTermId),
        where('class', '==', assignedClass)
      )
    : null;
  const [students, loadingStudents, errorStudents] = useCollectionData(studentsQuery, { idField: 'id' });

  // 3. Fetch today's attendance and merge with student list
  useEffect(() => {
    const mergeData = async () => {
      if (!students) {
        setStudentsWithAttendance([]);
        return;
      };

      if (!firestore || !activeTermId) {
        setStudentsWithAttendance(students.map(s => ({ ...s, attendance: 'unset' })));
        return;
      }

      const studentIds = students.map(s => s.id);
      if (studentIds.length === 0) {
        setStudentsWithAttendance([]);
        return;
      }
      
      const q = query(
        collection(firestore, 'attendanceRecords'),
        where('termId', '==', activeTermId),
        where('date', '==', todayDate),
        where('studentId', 'in', studentIds)
      );
      const querySnapshot = await getDocs(q);
      const existingAttendance = new Map<string, AttendanceStatus>();
      querySnapshot.forEach(doc => {
        const record = doc.data();
        existingAttendance.set(record.studentId, record.status);
      });
      
      setStudentsWithAttendance(students.map(s => ({
        ...s,
        attendance: existingAttendance.get(s.id) || 'unset'
      })));
    };
    
    mergeData();
  }, [students, firestore, activeTermId, todayDate]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent') => {
    setStudentsWithAttendance(prev => 
      prev.map(s => s.id === studentId ? { ...s, attendance: status } : s)
    );
  };

  const handleSaveAttendance = async () => {
    if (!firestore || !studentsWithAttendance || !activeTermId || !assignedClass || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Missing required data to save.' });
        return;
    }
    setIsSaving(true);
    
    try {
        const batch = writeBatch(firestore);
        
        for (const student of studentsWithAttendance) {
            if (student.attendance !== 'unset' && student.id) {
                const recordId = `${activeTermId}_${todayDate}_${student.id}`;
                const recordRef = doc(firestore, 'attendanceRecords', recordId);
                
                batch.set(recordRef, {
                    studentId: student.id,
                    studentName: student.name,
                    date: todayDate,
                    class: assignedClass,
                    termId: activeTermId,
                    status: student.attendance,
                    recordedBy: user.uid,
                    recordedAt: Timestamp.now(),
                }, { merge: true });
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
  
  const allMarked = studentsWithAttendance.length > 0 && studentsWithAttendance.every(s => s.attendance !== 'unset');
  const isLoading = loadingUser || loadingTerm || loadingAssignment || loadingStudents;

  const summary = {
    present: studentsWithAttendance.filter(s => s.attendance === 'present').length,
    absent: studentsWithAttendance.filter(s => s.attendance === 'absent').length,
    pending: studentsWithAttendance.filter(s => s.attendance === 'unset').length,
  };

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
        {studentsWithAttendance.length === 0 && !loadingStudents &&(
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center text-muted-foreground p-16">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50"/>
                <h3 className="text-lg font-semibold">No Students in Class</h3>
                <p>No students found for class {assignedClass} in the active term.</p>
            </motion.div>
        )}
        </AnimatePresence>
        {studentsWithAttendance.length > 0 && (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="pl-6 w-[60%]">Student</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {studentsWithAttendance.map((student, index) => (
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
                          <div className="flex justify-end gap-2">
                             <Button
                                size="sm"
                                variant={student.attendance === 'present' ? 'default' : 'outline'}
                                onClick={() => handleStatusChange(student.id, 'present')}
                                className={cn(
                                    "w-24",
                                    student.attendance === 'present' && "bg-green-600 hover:bg-green-700"
                                )}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant={student.attendance === 'absent' ? 'destructive' : 'outline'}
                                onClick={() => handleStatusChange(student.id, 'absent')}
                                className="w-24"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Absent
                              </Button>
                          </div>
                        </TableCell>
                    </motion.tr>
                    ))}
                </TableBody>
            </Table>
        )}
      </CardContent>
      {studentsWithAttendance.length > 0 && (
        <CardFooter className="bg-gradient-to-r from-primary/5 to-primary/10 border-t flex-wrap gap-4 justify-between">
            <p className="text-xs text-muted-foreground">
                {allMarked ? 'All students have been marked.' : 'Please mark all students to save.'}
            </p>
            <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">{summary.present} Present</Badge>
                <Badge variant="destructive">{summary.absent} Absent</Badge>
                <Badge variant="outline">{summary.pending} Pending</Badge>
            </div>
        </CardFooter>
      )}
    </Card>
    </motion.div>
  );
}
