
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
import { PlusCircle, Loader2, AlertTriangle, Pencil, Send } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { StudentFeesForm } from '../(components)/student-fees-form';
import { useActiveTerm } from '@/hooks/use-active-term';
import { SendListDialog } from '../(components)/send-list-dialog';

interface StudentData extends DocumentData {
  id: string;
  name: string;
  class: string;
  location: string;
  religion: string;
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
                  <TableHead className="hidden sm:table-cell">Parent Name</TableHead>
                  <TableHead className="hidden md:table-cell">Parent Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Religion</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsByClass[className].map((student) => {
                  const hasOutstanding = student.feesPaid < student.totalFees;
                  return (
                  <TableRow key={student.id} className={hasOutstanding ? "bg-destructive/10 hover:bg-destructive/20" : ""}>
                    <TableCell className="font-medium">
                        <div>{student.name}</div>
                        <div className="text-muted-foreground text-sm sm:hidden">{student.parentName}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{student.parentName}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.parentPhone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{student.religion}</TableCell>
                    <TableCell>
                      <Badge variant={hasOutstanding ? 'destructive' : 'secondary'} className="whitespace-nowrap">
                        {hasOutstanding && <AlertTriangle className="mr-1 h-3 w-3" />}
                        RWF {student.feesPaid.toLocaleString()} / {student.totalFees.toLocaleString()}
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
  const { activeTermId, loading: loadingTerm } = useActiveTerm();

  const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
  const [studentsSnapshot, loading, error] = useCollection(studentsQuery);

  const [isFeesFormOpen, setIsFeesFormOpen] = useState(false);
  const [isSendListOpen, setIsSendListOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  const students = studentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentData)) || [];

  const handleEditFees = (student: StudentData) => {
    setSelectedStudent(student);
    setIsFeesFormOpen(true);
  };
  
  const handleUpdate = () => {
    setSelectedStudent(null);
    setIsFeesFormOpen(false);
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage student records for the active term.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setIsSendListOpen(true)} className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4" />
                    Send List to Teacher
                </Button>
                <Link href={`/dashboard/secretary/students/add`} passHref>
                    <Button className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </Link>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {(loading || loadingTerm) && (
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
              {activeTermId ? "No students found for the active term. Use the 'Add Student' button to enroll the first student." : "No active term set. Please set an active term in the settings."}
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
            isOpen={isFeesFormOpen}
            onOpenChange={setIsFeesFormOpen}
            studentId={selectedStudent.id}
            studentName={selectedStudent.name}
            totalFees={selectedStudent.totalFees}
            currentFeesPaid={selectedStudent.feesPaid}
            onUpdate={handleUpdate}
        />
    )}

    <SendListDialog 
        isOpen={isSendListOpen} 
        onOpenChange={setIsSendListOpen} 
        students={students}
    />
    </>
  );
}
