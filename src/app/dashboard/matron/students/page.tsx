
'use client';
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
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Users, BedDouble } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { EditStudentForm } from './(components)/edit-student-form';
import { AssignDormForm } from './(components)/assign-dorm-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StudentData extends DocumentData {
  id: string;
  name: string;
  class: string;
  location: string;
  religion: string;
  dormitoryBed?: number;
}

interface StudentListByClassProps {
  students: StudentData[];
  onEdit: (student: StudentData) => void;
  onAssignBed: (student: StudentData) => void;
}

const StudentListByClass = ({ students, onEdit, onAssignBed }: StudentListByClassProps) => {
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
                  <TableHead className="hidden md:table-cell">Religion</TableHead>
                  <TableHead className="hidden md:table-cell">Parent</TableHead>
                  <TableHead>Dormitory</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsByClass[className].map((student, idx) => (
                  <TableRow key={student.id ?? `${className}-${idx}-${student.name ?? idx}`} className="hover:bg-card/50">
                    <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p>{student.name}</p>
                                <p className="text-sm text-muted-foreground sm:hidden">{student.location}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{student.religion || 'N/A'}</TableCell>
                     <TableCell className="hidden md:table-cell">
                        <div>
                            <p>{student.parentName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{student.parentPhone}</p>
                        </div>
                    </TableCell>
                     <TableCell>
                        {student.dormitoryBed ? `Bed ${student.dormitoryBed}` : <Badge variant="outline">Unassigned</Badge>}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <Button variant="ghost" size="icon" onClick={() => onAssignBed(student)} title="Assign Bed">
                            <BedDouble className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => onEdit(student)} title="Edit Student">
                            <Pencil className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
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

  const studentsQuery = firestore && activeTermId 
    ? query(
        collection(firestore, 'students'), 
        where('termId', '==', activeTermId),
        where('gender', '==', 'female')
      ) 
    : null;
<<<<<<< HEAD
  const [studentsSnapshot, loading, error] = useCollection(studentsQuery, { idField: 'id' } as any);
=======
  const [students, loading, error] = useCollectionData(studentsQuery, { idField: 'id' });
>>>>>>> 0329df6 (fix this error)

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDormFormOpen, setIsDormFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

<<<<<<< HEAD
  const students = studentsSnapshot?.docs.map(d => {
    const data = d.data() as StudentData;
    return { id: d.id, ...data };
  }) || [];
=======
  const studentData = students as StudentData[] || [];
>>>>>>> 0329df6 (fix this error)

  const handleEdit = (student: StudentData) => {
    setSelectedStudent(student);
    setIsEditFormOpen(true);
  };
  
  const handleAssignBed = (student: StudentData) => {
    setSelectedStudent(student);
    setIsDormFormOpen(true);
  }

  const handleUpdate = () => {
    setSelectedStudent(null);
    setIsEditFormOpen(false);
    setIsDormFormOpen(false);
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
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-6 w-6 text-primary"/>
            Female Students
        </CardTitle>
        <CardDescription className="text-base mt-1">View and manage student information for the active term.</CardDescription>
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
                {studentData.length > 0 ? (
                    <StudentListByClass students={studentData} onEdit={handleEdit} onAssignBed={handleAssignBed} />
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg"
                    >
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50"/>
                    <h3 className="text-lg font-semibold">No Students Found</h3>
                    <p className="mt-2">
                        {activeTermId ? "No female students found for the active term." : "No active term set. Please set an active term in the settings."}
                    </p>
                    </motion.div>
                )}
            </AnimatePresence>
        )}
      </CardContent>
      <CardFooter className="bg-gradient-to-r from-primary/5 to-primary/10 border-t">
        <div className="text-xs text-muted-foreground">
            { !loading && `Showing ${studentData.length} students.`}
        </div>
      </CardFooter>
    </Card>
    </motion.div>

    {selectedStudent && (
        <EditStudentForm
            isOpen={isEditFormOpen}
            onOpenChange={setIsEditFormOpen}
            student={selectedStudent}
            onUpdate={handleUpdate}
        />
    )}
     {selectedStudent && (
        <AssignDormForm
            isOpen={isDormFormOpen}
            onOpenChange={setIsDormFormOpen}
            student={selectedStudent}
            allStudents={studentData}
            onUpdate={handleUpdate}
        />
    )}
    </>
  );
}
