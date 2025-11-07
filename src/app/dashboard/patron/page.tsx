'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, AlertCircle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { materials } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function PatronDashboard() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId), where('gender', '==', 'male')) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    const requiredMaterials = materials.filter(m => m.required);

    const getMissingItems = (student: any) => {
        const presentMaterialIds = new Set(student.utilities?.filter((u: any) => u.status === 'present').map((u: any) => u.materialId) || []);
        return requiredMaterials.filter(m => !presentMaterialIds.has(m.id));
    }

    const studentsToMonitor = studentsSnapshot?.docs.map(doc => {
        const studentData = {id: doc.id, ...doc.data()};
        const missingItems = getMissingItems(studentData);
        return { ...studentData, missingItems };
    }) || [];

    const studentsWithMissingItems = studentsToMonitor.filter(s => s.missingItems.length > 0);
    const totalMissingCount = studentsWithMissingItems.reduce((acc, student) => acc + student.missingItems.length, 0);

    const isLoading = loadingTerm || loadingStudents;

    if (isLoading) {
        return <div>Loading...</div>
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Students with Missing Utilities</CardTitle>
                <CardDescription>A list of male students who have missing required items.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Missing Items</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                     {studentsWithMissingItems.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No students have missing items.
                            </TableCell>
                        </TableRow>
                    )}
                    {studentsWithMissingItems
                        .slice(0, 5)
                        .map(student => (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {student.missingItems.map(item => (
                                        <Badge key={item.id} variant="destructive">{item.name}</Badge>
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students Monitored</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{studentsToMonitor.length}</div>
                    <p className="text-xs text-muted-foreground">Boarding boys</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utility Alerts</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalMissingCount}</div>
                    <p className="text-xs text-muted-foreground">Total items that need attention.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
};
