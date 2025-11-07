

'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch, DocumentData, updateDoc, query, where } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateSeatingChart } from '@/lib/seating-chart-generator';
import { Loader2, AlertTriangle, User, Users, FileDown, PlusCircle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';
import type { UserRole } from '@/types';
import { Separator } from '@/components/ui/separator';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useActiveTerm } from '@/hooks/use-active-term';
import { EnrolledStudent } from '@/types/refectory';

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

const SeriesConfig = {
    morning: { first: 28, second: 11 },
    evening: { first: 28, second: 8 },
};

const TableTotals = {
    morning: SeriesConfig.morning.first + SeriesConfig.morning.second,
    evening: SeriesConfig.evening.first + SeriesConfig.evening.second,
}

const TableSeriesView = ({ students, meal }: { students: Student[], meal: 'morning' | 'evening' }) => {
    const tableField = meal === 'morning' ? 'refectoryTableMorning' : 'refectoryTableEvening';
    const series = SeriesConfig[meal];

    const getTableData = (tableNumber: number) => {
      const studentsAtTable = students.filter(s => s[tableField] === tableNumber);
      const boys = studentsAtTable.filter(s => s.gender === 'male');
      const girls = studentsAtTable.filter(s => s.gender === 'female');
      return {
        number: tableNumber,
        students: studentsAtTable,
        boys,
        girls,
        boyCount: boys.length,
        girlCount: girls.length,
      };
    }
    
    const firstSeriesTables = Array.from({ length: series.first }, (_, i) => getTableData(i + 1));
    const secondSeriesTables = Array.from({ length: series.second }, (_, i) => getTableData(series.first + i + 1));

    const renderTableCard = (table: ReturnType<typeof getTableData>, serie: string) => {
        const boyProgress = (table.boyCount / TableCapacity.boys) * 100;
        const girlProgress = (table.girlCount / TableCapacity.girls) * 100;

        return (
            <Card key={`grid-${serie}-${table.number}`}>
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Table {table.number}</CardTitle>
                    <Badge variant="outline">Serie {serie}</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span>Boys</span>
                            <span>{table.boyCount}/{TableCapacity.boys}</span>
                        </div>
                        <Progress value={boyProgress} />
                        <div className="mt-2 space-y-1">
                          {table.boys.map(s => (
                              <div key={`${s.id}-${Math.random()}`} className="flex items-center gap-2 text-muted-foreground">
                                <UserCheck className="h-3 w-3 text-green-500" />
                                <span>{s.name} ({s.class})</span>
                              </div>
                          ))}
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between mb-1">
                            <span>Girls</span>
                            <span>{table.girlCount}/{TableCapacity.girls}</span>
                        </div>
                        <Progress value={girlProgress} />
                         <div className="mt-2 space-y-1">
                          {table.girls.map(s => (
                              <div key={`${s.id}-${Math.random()}`} className="flex items-center gap-2 text-muted-foreground">
                                <UserCheck className="h-3 w-3 text-pink-500" />
                                <span>{s.name} ({s.class})</span>
                              </div>
                          ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4">Serie 1 Tables ({series.first} Tables)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {firstSeriesTables.map(table => renderTableCard(table, '1'))}
                </div>
            </div>
             <div>
                <h3 className="text-xl font-semibold mb-4">Serie 2 Tables ({series.second} Tables)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {secondSeriesTables.map(table => renderTableCard(table, '2'))}
                </div>
            </div>
        </div>
    );
}

const StudentView = ({ students, meal }: { students: Student[], meal: 'morning' | 'evening'}) => {
    const tableField = meal === 'morning' ? 'refectoryTableMorning' : 'refectoryTableEvening';
    const sortedStudents = [...students].sort((a,b) => a.name.localeCompare(b.name));
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
            {sortedStudents.map(student => (
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
  const [viewType, setViewType] = useState<'table' | 'student'>('table');
  const { activeTermId, loading: loadingTerm } = useActiveTerm();
  
  const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
  const [students, loading, error] = useCollectionData(studentsQuery, { idField: 'id' });

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
      const enrolledStudents: EnrolledStudent[] = students.map(s => ({
          id: s.id,
          fullName: s.name,
          gender: s.gender,
          class: s.class,
      }));

      const { morning, evening } = generateSeatingChart(enrolledStudents);

      const batch = writeBatch(firestore);
      
      const studentAssignments = new Map<string, { morning?: number; evening?: number }>();

      const processShift = (tables: any[], shift: 'morning' | 'evening') => {
        tables.forEach(table => {
          [...table.boys, ...table.girls].forEach((student: EnrolledStudent) => {
            if (student.id) {
              if (!studentAssignments.has(student.id)) {
                studentAssignments.set(student.id, {});
              }
              const assignment = studentAssignments.get(student.id)!;
              if (shift === 'morning') assignment.morning = table.tableNumber;
              if (shift === 'evening') assignment.evening = table.tableNumber;
            }
          });
        });
      };
    
      processShift(morning, 'morning');
      processShift(evening, 'evening');

      studentAssignments.forEach((assignments, studentId) => {
        const studentRef = doc(firestore, 'students', studentId);
        batch.update(studentRef, { 
            refectoryTableMorning: assignments.morning ?? null,
            refectoryTableEvening: assignments.evening ?? null
        });
      });


      await batch.commit();

      toast.success({
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
  
  const handleExport = () => {
    if (!students) return;

    const dataToExport = students.sort((a,b) => a.name.localeCompare(b.name)).map(s => ({
        "Student Name": s.name,
        "Class": s.class,
        "Gender": s.gender,
        "Morning & Lunch Table": s.refectoryTableMorning || 'Unassigned',
        "Evening Table": s.refectoryTableEvening || 'Unassigned',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `refectory_assignments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const unassignedStudents = students?.filter(s => !s.refectoryTableMorning || !s.refectoryTableEvening).length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Refectory Seating</CardTitle>
            <CardDescription>Manage and view student seating arrangements for meals.</CardDescription>
             {unassignedStudents > 0 && !loading && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    There are {unassignedStudents} students without a complete table assignment.
                </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {(role === 'admin' || role === 'secretary') && (
              <Button onClick={handleAssignTables} disabled={isAssigning || loading} className="w-full sm:w-auto">
                {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign All Students
              </Button>
            )}
             <Button onClick={handleExport} variant="outline" disabled={!students || students.length === 0} className="w-full sm:w-auto">
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(loading || loadingTerm) && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <p className="text-destructive">Error loading students: {error.message}</p>}
        {students && (
          <Tabs defaultValue="morning">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="morning">Morning & Lunch ({TableTotals.morning} tables)</TabsTrigger>
              <TabsTrigger value="evening">Evening ({TableTotals.evening} tables)</TabsTrigger>
            </TabsList>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                     <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'table' | 'student')} className="mt-4">
                        <TabsList>
                            <TabsTrigger value="table"><Users className="mr-2"/>View by Table</TabsTrigger>
                            <TabsTrigger value="student"><User className="mr-2"/>View by Student</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <Separator />
                <div className="mt-4">
                    <TabsContent value="morning">
                        {viewType === 'student' ? (
                            <StudentView students={students as Student[]} meal="morning" />
                        ) : (
                            <TableSeriesView students={students as Student[]} meal="morning" />
                        )}
                    </TabsContent>
                    <TabsContent value="evening">
                        {viewType === 'student' ? (
                            <StudentView students={students as Student[]} meal="evening" />
                        ) : (
                            <TableSeriesView students={students as Student[]} meal="evening" />
                        )}
                    </TabsContent>
                </div>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
