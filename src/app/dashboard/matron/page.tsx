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
import { Users, AlertCircle, ClipboardList } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { materials } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';


export default function MatronDashboard() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();
    
    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId), where('gender', '==', 'female')) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    const requiredMaterials = materials.filter(m => m.required);
    const requiredMaterialIds = requiredMaterials.map(m => m.id);

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
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">Matron Dashboard</h1>
                <p className="text-muted-foreground">Overview of female students' status and needs.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students Monitored</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{studentsToMonitor.length}</div>
                    <p className="text-xs text-muted-foreground">Total female boarding students in active term</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utility Alerts</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{totalMissingCount}</div>
                    <p className="text-xs text-muted-foreground">Total required items reported missing</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students with Missing Items</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{studentsWithMissingItems.length}</div>
                    <p className="text-xs text-muted-foreground">Students needing attention for utilities</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Students with Missing Utilities</CardTitle>
            <CardDescription>A list of female students who have missing required items. <Link href="/dashboard/matron/utilities" className="text-primary underline">View all</Link>.</CardDescription>
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
                            All students have their required items.
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
  )
};
