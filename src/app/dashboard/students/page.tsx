
'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, DocumentData } from 'firebase/firestore';

interface StudentData extends DocumentData {
  id: string;
  name: string;
  class: string;
  location: string;
  parentName: string;
  parentPhone: string;
}

const StudentListByClass = ({ students }: { students: StudentData[] }) => {
  const studentsByClass = students.reduce((acc, student) => {
    const { class: studentClass } = student;
    if (!acc[studentClass]) {
      acc[studentClass] = [];
    }
    acc[studentClass].push(student);
    return acc;
  }, {} as Record<string, StudentData[]>);

  const sortedClasses = Object.keys(studentsByClass).sort();

  return (
    <Accordion type="single" collapsible className="w-full">
      {sortedClasses.map((className) => (
        <AccordionItem value={className} key={className}>
          <AccordionTrigger>{className}</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Parent Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsByClass[className].map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.location}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>{student.parentPhone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};


export default function StudentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const role = user?.role as UserRole | undefined ?? 'secretary';
  const canAddStudents = role === 'secretary' || role === 'admin';

  const [studentsSnapshot, loading, error] = useCollection(
    firestore ? collection(firestore, 'students') : null
  );

  const students = studentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentData)) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage student records, view details, and track enrollment.</CardDescription>
            </div>
            {canAddStudents && (
            <Link href={`/dashboard/students/add`} passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </Link>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
            <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {error && <p className="text-destructive">Error loading students: {error.message}</p>}
        {!loading && !error && (
          students.length > 0 ? (
            <StudentListByClass students={students} />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No students found.
            </div>
          )
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
            { !loading && `Showing ${students.length} students.`}
        </div>
      </CardFooter>
    </Card>
  );
}
