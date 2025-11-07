'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch, DocumentData, updateDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assignRefectoryTables } from '@/ai/flows/assign-refectory-tables-flow';
import { Loader2, AlertTriangle, User, Users, LayoutGrid, List, FileDown, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';
import type { UserRole } from '@/types';
import { Separator } from '@/components/ui/separator';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const TableSeriesView = ({ students, meal, view }: { students: Student[], meal: 'morning' | 'evening', view: 'list' | 'grid' }) => {
    const tableField = meal === 'morning' ? 'refectoryTableMorning' : 'refectoryTableEvening';
    const series = SeriesConfig[meal];
    
    const getTableData = (tableNumber: number) => {
      const studentsAtTable = students.filter(s => s[tableField] === tableNumber);
      const boys = studentsAtTable.filter(s => s.gender === 'male');
      const girls = studentsAtTable.filter(s => s.gender === 'female');
      return {
        number: tableNumber,
        students: studentsAtTable,
        boyCount: boys.length,
        girlCount: girls.length,
      };
    }
    
    const firstSeriesTables = Array.from({ length: series.first }, (_, i) => getTableData(i + 1));
    const secondSeriesTables = Array.from({ length: series.second }, (_, i) => getTableData(series.first + i + 1));


    if (view === 'grid') {
        return (
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">First Series ({series.first} Tables)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {firstSeriesTables.map(table => (
                            <Card key={`grid-1-${table.number}`}>
                                <CardHeader className="p-4">
                                    <CardTitle>Table {table.number}</CardTitle>
                                    <CardDescription className="flex items-center gap-4">
                                        <Badge variant={table.boyCount > TableCapacity.boys ? 'destructive' : 'secondary'}>Boys: {table.boyCount}/{TableCapacity.boys}</Badge>
                                        <Badge variant={table.girlCount > TableCapacity.girls ? 'destructive' : 'secondary'}>Girls: {table.girlCount}/{TableCapacity.girls}</Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-sm">
                                    {table.students.length > 0 ? table.students.map(s => `${s.name} (${s.class})`).join(', ') : <span className="text-muted-foreground">Empty</span>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-4">Second Series ({series.second} Tables)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {secondSeriesTables.map(table => (
                            <Card key={`grid-2-${table.number}`}>
                                <CardHeader className="p-4">
                                    <CardTitle>Table {table.number}</CardTitle>
                                    <CardDescription className="flex items-center gap-4">
                                        <Badge variant={table.boyCount > TableCapacity.boys ? 'destructive' : 'secondary'}>Boys: {table.boyCount}/{TableCapacity.boys}</Badge>
                                        <Badge variant={table.girlCount > TableCapacity.girls ? 'destructive' : 'secondary'}>Girls: {table.girlCount}/{TableCapacity.girls}</Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-sm">
                                     {table.students.length > 0 ? table.students.map(s => `${s.name} (${s.class})`).join(', ') : <span className="text-muted-foreground">Empty</span>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-4">First Series</h3>
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
                        {firstSeriesTables.map(table => (
                            <TableRow key={`list-1-${table.number}`}>
                                <TableCell className="font-bold">{table.number}</TableCell>
                                <TableCell><Badge variant={table.boyCount > TableCapacity.boys ? 'destructive' : 'secondary'}>{table.boyCount} / {TableCapacity.boys}</Badge></TableCell>
                                <TableCell><Badge variant={table.girlCount > TableCapacity.girls ? 'destructive' : 'secondary'}>{table.girlCount} / {TableCapacity.girls}</Badge></TableCell>
                                <TableCell>{table.students.map(s => `${s.name} (${s.class})`).join(', ')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-4">Second Series</h3>
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
                         {secondSeriesTables.map(table => (
                            <TableRow key={`list-2-${table.number}`}>
                                <TableCell className="font-bold">{table.number}</TableCell>
                                <TableCell><Badge variant={table.boyCount > TableCapacity.boys ? 'destructive' : 'secondary'}>{table.boyCount} / {TableCapacity.boys}</Badge></TableCell>
                                <TableCell><Badge variant={table.girlCount > TableCapacity.girls ? 'destructive' : 'secondary'}>{table.girlCount} / {TableCapacity.girls}</Badge></TableCell>
                                <TableCell>{table.students.map(s => `${s.name} (${s.class})`).join(', ')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

const StudentView = ({ students, meal, onAssign }: { students: Student[], meal: 'morning' | 'evening', onAssign: (student: Student, meal: 'morning' | 'evening') => void}) => {
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
              <TableHead className="text-right">Actions</TableHead>
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
                 <TableCell className="text-right">
                    {!student[tableField] && (
                        <Button size="sm" variant="outline" onClick={() => onAssign(student, meal)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Assign
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    )
}

interface AssignDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  meal: 'morning' | 'evening';
  allStudents: Student[];
  onAssignSuccess: () => void;
}

const AssignTableDialog = ({ isOpen, onOpenChange, student, meal, allStudents, onAssignSuccess }: AssignDialogProps) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedTable, setSelectedTable] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    if (!student) return null;

    const tableField = meal === 'morning' ? 'refectoryTableMorning' : 'refectoryTableEvening';
    const totalTables = TableTotals[meal];
    
    const availableTables = Array.from({ length: totalTables }, (_, i) => i + 1).filter(tableNum => {
        const studentsAtTable = allStudents.filter(s => s[tableField] === tableNum);
        const capacity = student.gender === 'male' ? TableCapacity.boys : TableCapacity.girls;
        const currentCount = studentsAtTable.filter(s => s.gender === student.gender).length;
        return currentCount < capacity;
    });

    const handleSave = async () => {
        if (!firestore || !student || !selectedTable) return;
        setIsSaving(true);
        try {
            const studentRef = doc(firestore, 'students', student.id);
            await updateDoc(studentRef, {
                [tableField]: Number(selectedTable)
            });
            toast({ title: 'Success!', description: `${student.name} has been assigned to table ${selectedTable}.`});
            onAssignSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not assign table.' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Table for {student.name}</DialogTitle>
                    <DialogDescription>
                        Assigning for {meal === 'morning' ? 'Morning & Lunch' : 'Evening'} meal.
                        Only tables with available spots for a {student.gender} are shown.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Select onValueChange={setSelectedTable} value={selectedTable}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a table" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTables.map(tableNum => (
                                <SelectItem key={tableNum} value={String(tableNum)}>
                                    Table {tableNum}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={isSaving || !selectedTable}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function RefectoryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const { user } = useUser();
  const role = user?.role as UserRole | undefined;
  const [viewType, setViewType] = useState<'table' | 'student'>('table');
  const [tableDisplay, setTableDisplay] = useState<'list' | 'grid'>('list');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<'morning' | 'evening'>('morning');
  
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
          class: s.class,
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

  const handleOpenAssignDialog = (student: Student, meal: 'morning' | 'evening') => {
    setSelectedStudent(student);
    setSelectedMeal(meal);
    setIsAssignDialogOpen(true);
  }

  const unassignedStudents = students?.filter(s => !s.refectoryTableMorning || !s.refectoryTableEvening).length || 0;

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
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
          <div className="flex gap-2">
            {(role === 'admin' || role === 'secretary') && (
              <Button onClick={handleAssignTables} disabled={isAssigning || loading}>
                {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign All Students
              </Button>
            )}
             <Button onClick={handleExport} variant="outline" disabled={!students || students.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
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
                    {viewType === 'table' && (
                        <div>
                             <Button variant={tableDisplay === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTableDisplay('list')}><List className="h-4 w-4"/></Button>
                             <Button variant={tableDisplay === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTableDisplay('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                        </div>
                    )}
                </div>
                <Separator />
                <div className="mt-4">
                    <TabsContent value="morning">
                        {viewType === 'student' ? (
                            <StudentView students={students as Student[]} meal="morning" onAssign={handleOpenAssignDialog} />
                        ) : (
                            <TableSeriesView students={students as Student[]} meal="morning" view={tableDisplay} />
                        )}
                    </TabsContent>
                    <TabsContent value="evening">
                        {viewType === 'student' ? (
                            <StudentView students={students as Student[]} meal="evening" onAssign={handleOpenAssignDialog} />
                        ) : (
                            <TableSeriesView students={students as Student[]} meal="evening" view={tableDisplay} />
                        )}
                    </TabsContent>
                </div>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>

    <AssignTableDialog
      isOpen={isAssignDialogOpen}
      onOpenChange={setIsAssignDialogOpen}
      student={selectedStudent}
      meal={selectedMeal}
      allStudents={students as Student[]}
      onAssignSuccess={() => { /* Data will refetch automatically through react-firebase-hooks */ }}
    />
    </>
  );
}
