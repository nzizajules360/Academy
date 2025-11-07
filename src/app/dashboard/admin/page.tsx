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
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, ClipboardList } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';


const RecentEnrollments = ({ students }: { students: DocumentData[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Enrollments</CardTitle>
      <CardDescription>A list of the most recently added students.</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.slice(0, 5).map(student => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.class}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
    const firestore = useFirestore();
    const [studentsSnapshot, loading] = useCollection(
        firestore ? collection(firestore, 'students') : null
    );

    const students = studentsSnapshot?.docs.map(doc => doc.data()) || [];
    const totalStudents = students.length;
    const totalFeesPaid = students.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
    const totalFeesExpected = students.reduce((acc, s) => acc + (s.totalFees || 0), 0);
    const feesPaidPercentage = totalFeesExpected > 0 ? (totalFeesPaid / totalFeesExpected) * 100 : 0;
    
    const utilitiesMissing = 0; 
    
    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <RecentEnrollments students={studentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data()})) || []} />
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">${totalFeesPaid.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        of ${totalFeesExpected.toLocaleString()} collected
                    </p>
                    <Progress value={feesPaidPercentage} className="mt-2 h-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utilities Status</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{utilitiesMissing}</div>
                    <p className="text-xs text-muted-foreground">items reported missing</p>
                    </CardContent>
                </Card>
            </div>
      </div>
  );
}
