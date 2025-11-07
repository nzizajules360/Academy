
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
import { PlusCircle, Loader2, AlertTriangle, Pencil, Users } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { StudentFeesForm } from '../../secretary/(components)/student-fees-form';
import { useActiveTerm } from '@/hooks/use-active-term';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


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
        <motion.div
            key={className}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <AccordionItem value={className} className="border-b-0 mb-3 overflow-hidden rounded-lg border bg-card/50 shadow-sm">
                <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        {className}
                        <Badge variant="secondary">{studentsByClass[className].length} students</Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="bg-accent/20">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="pl-6">Name</TableHead>
                        <TableHead className="hidden md:table-cell">Parent Name</TableHead>
                        <TableHead className="hidden lg:table-cell">Parent Phone</TableHead>
                        <TableHead>Fee Status</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {studentsByClass[className].map((student) => {
                        const hasOutstanding = student.feesPaid < student.totalFees;
                        return (
                        <TableRow key={student.id} className={hasOutstanding ? "bg-destructive/10 hover:bg-destructive/20" : "hover:bg-card/50"}>
                            <TableCell className="font-medium pl-6">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className={hasOutstanding ? "bg-destructive/20" : ""}>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p>{student.name}</p>
                                        <p className="text-sm text-muted-foreground md:hidden">{student.parentName}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{student.parentName}</TableCell>
                            <TableCell className="hidden lg:table-cell">{student.parentPhone}</TableCell>
                            <TableCell>
                            <Badge variant={hasOutstanding ? 'destructive' : 'secondary'} className="text-sm whitespace-nowrap">
                                {hasOutstanding && <AlertTriangle className="mr-1 h-3 w-3" />}
                                RWF {student.feesPaid.toLocaleString()} / {student.totalFees.toLocaleString()}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
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
        </motion.div>
      ))}
    </Accordion>
  );
};


export default function StudentsPage() {
  const firestore = useFirestore();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();

  const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
  const [studentsSnapshot, loading, error] = useCollection(studentsQuery);

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
                        <Users className="h-6 w-6 text-primary"/>
                        Student Roster
                    </CardTitle>
                    <CardDescription className="text-base mt-1">Manage student records for the active term.</CardDescription>
                </div>
                <Link href={`/dashboard/secretary/students/add`} passHref>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent className="p-6">
            {(loading || loadingTerm) && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
            {error && <p className="text-destructive p-4">Error loading students: {error.message}</p>}
            {!(loading || loadingTerm) && !error && (
            <AnimatePresence>
            {students.length > 0 ? (
                <StudentListByClass students={students} onEditFees={handleEditFees} />
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg"
                >
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50"/>
                    <h3 className="text-lg font-semibold">No Students Enrolled</h3>
                    <p className="mt-2">
                    {activeTermId ? "Use the 'Add Student' button to enroll the first student." : "No active term set. Please set an active term in the settings."}
                    </p>
                </motion.div>
            )}
            </AnimatePresence>
            )}
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-primary/5 to-primary/10 border-t">
            <div className="text-xs text-muted-foreground">
                { !loading && `Showing ${students.length} students.`}
            </div>
        </CardFooter>
        </Card>
    </motion.div>

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
