'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
                // This is an upsert operation. We use a predictable ID to overwrite existing records for the same student/day.
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
  
  const allMarked = students && students.length > 0 && students.every(s => attendance[s.id]);
  const isLoading = loadingUser || loadingTerm || loadingAssignment || loadingStudents;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!assignedClass) {
    return (
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>No Class Assigned</CardTitle>
          </CardHeader>
          <CardContent>
              <p>You have not been assigned to a class yet. Please contact an administrator.</p>
          </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Class Attendance: {assignedClass}</CardTitle>
                <CardDescription>Mark attendance for {format(new Date(), 'PPPP')}.</CardDescription>
            </div>
             <Button onClick={handleSaveAttendance} disabled={isSaving || !allMarked} className="w-full md:w-auto">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {allMarked && Object.keys(attendance).length > 0 ? <CheckCircle className="mr-2 h-4 w-4"/> : null}
                Save Attendance
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {errorStudents && <p className="text-destructive">Error loading students: {errorStudents.message}</p>}
        {students && students.length === 0 && (
            <p className="text-muted-foreground">No students found for class {assignedClass} in the active term.</p>
        )}
        {students && students.length > 0 && (
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map(student => (
                    <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-right">
                        <RadioGroup
                            value={attendance[student.id]}
                            onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                            className="flex justify-end gap-4"
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
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
