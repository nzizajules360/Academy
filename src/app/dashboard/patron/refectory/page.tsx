'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assignRefectoryTables } from '@/ai/flows/assign-refectory-tables-flow';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';
import type { UserRole } from '@/types';

interface Student extends DocumentData {
  id: string;
  name: string;
  gender: 'male' | 'female';
  class: string;
  refectoryTableMorning?: number;
  refectoryTableEvening?: number;
}

const TableCapacity = {
  boys: 3,
  girls: 7,
};

const TableTotals = {
    morning: 28 + 11,
    evening: 28 + 8,
}

const TableView = ({ students, meal }: { students: Student[], meal: 'morning' | 'evening'}) => {
    const tableField = meal === 'morning' ? 'refectoryTableMorning' : 'refectoryTableEvening';
    const totalTables = meal === 'morning' ? TableTotals.morning : TableTotals.evening;
  
    const tables = Array.from({ length: totalTables }, (_, i) => i + 1).map(tableNumber => {
      const studentsAtTable = students.filter(s => s[tableField] === tableNumber);
      const boys = studentsAtTable.filter(s => s.gender === 'male');
      const girls = studentsAtTable.filter(s => s.gender === 'female');
      return {
        number: tableNumber,
        students: studentsAtTable,
        boyCount: boys.length,
        girlCount: girls.length,
      };
    });

    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table No.</TableHead>
              <TableHead>Boys</TableHead>
              <TableHead>Girls</TableHead>
              <TableHead>Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map(table => (
              <TableRow key={table.number}>
                <TableCell className="font-bold">{table.number}</TableCell>
                <TableCell>
                  <Badge variant={table.boyCount > TableCapacity.boys ? 'destructive' : 'secondary'}>
                    {table.boyCount} / {TableCapacity.boys}
                  </Badge>
                </TableCell>
                 <TableCell>
                  <Badge variant={table.girlCount > TableCapacity.girls ? 'destructive' : 'secondary'}>
                    {table.girlCount} / {TableCapacity.girls}
                  </Badge>
                </TableCell>
                <TableCell>
                  {table.students.map(s => s.name).join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}

const StudentView = ({ students, meal }: { students: Student[], meal: 'morning' | 'evening'}) => {
    const tableField = meal === 'morning' ? 'refectoryTableMorning' : 'refectoryTableEvening';
    return (
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Assigned Table</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map(student => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>
                    {student[tableField] ? student[tableField] : <Badge variant="outline">Unassigned</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}


export default function RefectoryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const { user } = useUser();
  const role = user?.role as UserRole | undefined;
  
  const studentsCollection = firestore ? collection(firestore, 'students') : null;
  const [students, loading, error] = useCollectionData(studentsCollection, { idField: 'id' });

  const handleAssignTables = async () => {
    setIsAssigning(true);
    if (!firestore || !students) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore or student data not available.',
      });
      setIsAssigning(false);
      return;
    }

    try {
      const allStudents = students.map(s => ({
          id: s.id,
          name: s.name,
          gender: s.gender,
      }));

      const assignments = await assignRefectoryTables({ students: allStudents });

      const batch = writeBatch(firestore);
      assignments.forEach(assignment => {
        const studentRef = doc(firestore, 'students', assignment.studentId);
        batch.update(studentRef, {
          refectoryTableMorning: assignment.morningTable,
          refectoryTableEvening: assignment.eveningTable,
        });
      });

      await batch.commit();

      toast({
        title: 'Assignments Complete',
        description: 'All students have been assigned to refectory tables.',
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Assignment Failed',
        description: 'An error occurred while assigning tables. Please try again.',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const unassignedStudents = students?.filter(s => !s.refectoryTableMorning || !s.refectoryTableEvening).length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Refectory Seating</CardTitle>
            <CardDescription>Manage and view student seating arrangements for meals.</CardDescription>
          </div>
          {(role === 'admin' || role === 'secretary') && (
            <Button onClick={handleAssignTables} disabled={isAssigning || loading}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign All Students
            </Button>
          )}
        </div>
        {unassignedStudents > 0 && (
             <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                There are {unassignedStudents} students without a complete table assignment.
            </div>
        )}
      </CardHeader>
      <CardContent>
        {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <p className="text-destructive">Error loading students: {error.message}</p>}
        {students && (
          <Tabs defaultValue="morning">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="morning">Morning & Lunch</TabsTrigger>
              <TabsTrigger value="evening">Evening</TabsTrigger>
            </TabsList>
            <TabsContent value="morning">
                <Tabs defaultValue="table-view" className="mt-4">
                    <TabsList>
                        <TabsTrigger value="table-view">View by Table</TabsTrigger>
                        <TabsTrigger value="student-view">View by Student</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table-view">
                        <TableView students={students as Student[]} meal="morning" />
                    </TabsContent>
                    <TabsContent value="student-view">
                        <StudentView students={students as Student[]} meal="morning" />
                    </TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="evening">
                 <Tabs defaultValue="table-view" className="mt-4">
                    <TabsList>
                        <TabsTrigger value="table-view">View by Table</TabsTrigger>
                        <TabsTrigger value="student-view">View by Student</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table-view">
                        <TableView students={students as Student[]} meal="evening" />
                    </TabsContent>
                    <TabsContent value="student-view">
                        <StudentView students={students as Student[]} meal="evening" />
                    </TabsContent>
                </Tabs>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
