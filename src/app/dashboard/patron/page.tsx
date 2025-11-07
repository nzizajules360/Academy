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
import { collection } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

export default function PatronDashboard() {
    const firestore = useFirestore();
    const [studentsSnapshot, loading] = useCollection(
        firestore ? collection(firestore, 'students') : null
    );

    const genderToMonitor = 'male';
    const studentsToMonitor = studentsSnapshot?.docs
        .map(doc => doc.data())
        .filter(s => s.gender === genderToMonitor) || [];

    const studentCount = studentsToMonitor.length;
    const missingCount = 0;

    if (loading) {
        return <div>Loading...</div>
    }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Students with Missing Utilities</CardTitle>
                <CardDescription>A list of students who have missing items.</CardDescription>
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
                    {studentsToMonitor
                        .slice(0, 5)
                        .map(student => (
                        <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>0</TableCell>
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
                    <div className="text-2xl font-bold">{studentCount}</div>
                    <p className="text-xs text-muted-foreground">Boarding boys</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utility Alerts</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{missingCount}</div>
                    <p className="text-xs text-muted-foreground">Items need attention</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
};
