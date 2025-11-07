'use client';
import Link from 'next/link';
import { useState } from 'react';
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
import { PlusCircle, Loader2, AlertTriangle, Pencil } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, DocumentData } from 'firebase/firestore';
import { StudentFeesForm } from '../(components)/student-fees-form';

interface StudentData extends DocumentData {
  id: string;
  name: string;
  class: string;
  location: string;
  parentName: string;
  parentPhone: string;
  totalFees: number;
  feesPaid: number;
}

interface StudentListByClassProps {
  students: StudentData[];
  onEditFees: (student: StudentData) => void;
}

const StudentListByClass = ({ students, onEditFees }: StudentListByClassProps) => {
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
    <Accordion type="single" collapsible className="w-full" defaultValue={sortedClasses[0]}>
      {sortedClasses.map((className) => (
        <AccordionItem value={className} key={className}>
          <AccordionTrigger>{className} ({studentsByClass[className].length})</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent Name</TableHead>
                  <TableHead>Parent Phone</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsByClass[className].map((student) => {
                  const hasOutstanding = student.feesPaid < student.totalFees;
                  return (
                  <TableRow key={student.id} className={hasOutstanding ? "bg-destructive/10 hover:bg-destructive/20" : ""}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>{student.parentPhone}</TableCell>
                    <TableCell>
                      <Badge variant={hasOutstanding ? 'destructive' : 'secondary'}>
                        {hasOutstanding && <AlertTriangle className="mr-1 h-3 w-3" />}
                        ${student.feesPaid.toLocaleString()} / ${student.totalFees.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => onEditFees(student)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit Fees</span>
                       </Button>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};


export default function StudentsPage() {
  const firestore = useFirestore();
  
  const [studentsSnapshot, loading, error] = useCollection(
    firestore ? collection(firestore, 'students') : null
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  const students = studentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentData)) || [];

  const handleEditFees = (student: StudentData) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };
  
  const handleUpdate = () => {
    setSelectedStudent(null);
    setIsFormOpen(false);
  }


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage student records, view details, and track enrollment.</CardDescription>
            </div>
            <Link href={`/dashboard/secretary/students/add`} passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {error && <p className="text-destructive p-4">Error loading students: {error.message}</p>}
        {!loading && !error && (
          students.length > 0 ? (
            <StudentListByClass students={students} onEditFees={handleEditFees} />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No students found. Use the "Add Student" button to enroll the first student.
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

    {selectedStudent && (
        <StudentFeesForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            studentId={selectedStudent.id}
            studentName={selectedStudent.name}
            totalFees={selectedStudent.totalFees}
            currentFeesPaid={selectedStudent.feesPaid}
            onUpdate={handleUpdate}
        />
    )}
    </>
  );
}
