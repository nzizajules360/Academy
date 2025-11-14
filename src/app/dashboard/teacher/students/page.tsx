
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function MyStudentsPage() {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();
  
  const [assignedClass, setAssignedClass] = useState<string | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);

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
                      <BookOpen className="h-6 w-6 text-primary" />
                      My Students: Class {assignedClass}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Your official class roster for the active academic term.
                  </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {errorStudents && <p className="text-destructive p-6">Error loading students: {errorStudents.message}</p>}
          {students && students.length === 0 && !loadingStudents && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center text-muted-foreground p-16">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50"/>
                  <h3 className="text-lg font-semibold">No Students Enrolled</h3>
                  <p>There are currently no students enrolled in your class for this term.</p>
              </motion.div>
          )}
          {students && students.length > 0 && (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="pl-6 w-[40%]">Student Name</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Home Location</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {students.map((student, index) => (
                          <TableRow key={student.id}>
                              <TableCell className="font-medium pl-6">
                                  <motion.div 
                                      className="flex items-center gap-3"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                  >
                                      <Avatar className="h-8 w-8">
                                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      {student.name}
                                  </motion.div>
                              </TableCell>
                              <TableCell className="capitalize">
                                  <Badge variant={student.gender === 'male' ? 'secondary' : 'outline'}>{student.gender}</Badge>
                              </TableCell>
                              <TableCell>{student.location}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          )}
        </CardContent>
        {students && (
          <CardFooter className="bg-gradient-to-r from-primary/5 to-primary/10 border-t">
              <p className="text-xs text-muted-foreground">
                  Showing {students.length} students in your class.
              </p>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
