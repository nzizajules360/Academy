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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, ClipboardList, AlertCircle, UserPlus, BookOpen } from 'lucide-react';
import type { UserRole } from '@/types';
import { useUser, useFirestore } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, DocumentData } from 'firebase/firestore';


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

const AdminDashboard = () => {
    const firestore = useFirestore();
    const [studentsSnapshot, loading] = useCollection(
        firestore ? collection(firestore, 'students') : null
    );

    const students = studentsSnapshot?.docs.map(doc => doc.data()) || [];
    const totalStudents = students.length;
    const totalFeesPaid = students.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
    const totalFeesExpected = students.reduce((acc, s) => acc + (s.totalFees || 0), 0);
    const feesPaidPercentage = totalFeesExpected > 0 ? (totalFeesPaid / totalFeesExpected) * 100 : 0;
    
    // Note: 'utilities' data is not in Firestore yet, so this will be 0.
    // This can be implemented once utility tracking is moved to Firestore.
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

const PatronMatronDashboard = ({ role }: { role: 'patron' | 'matron' }) => {
    const firestore = useFirestore();
    const [studentsSnapshot, loading] = useCollection(
        firestore ? collection(firestore, 'students') : null
    );

    const genderToMonitor = role === 'patron' ? 'male' : 'female';
    const studentsToMonitor = studentsSnapshot?.docs
        .map(doc => doc.data())
        .filter(s => s.gender === genderToMonitor) || [];

    const studentCount = studentsToMonitor.length;
    // Note: 'utilities' data is not in Firestore yet, so this will be 0.
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
                        .slice(0, 5) // Placeholder logic, will be updated when utilities are in Firestore
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
                    <p className="text-xs text-muted-foreground">Boarding {role === 'patron' ? 'boys' : 'girls'}</p>
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

const SecretaryDashboard = () => {
    const firestore = useFirestore();
    const [studentsSnapshot, loading] = useCollection(
        firestore ? collection(firestore, 'students') : null
    );

    const totalStudents = studentsSnapshot?.docs.length || 0;

    return (
        <div className='space-y-8'>
            <div className="grid md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enroll Student</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Add a new student to the school registry.</p>
                        <Link href="/dashboard/students/add" passHref>
                          <Button>Go to Enrollment Form</Button>
                        </Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">View Students</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">See a list of all currently enrolled students by class.</p>
                         <Link href="/dashboard/students" passHref>
                          <Button>View Student List</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
            <div>
              <Card>
                  <CardHeader>
                      <CardTitle>Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{loading ? '...' : totalStudents}</div>
                      <p className="text-xs text-muted-foreground">
                          students enrolled in the system.
                      </p>
                  </CardContent>
              </Card>
            </div>
        </div>
    );
}


export default function DashboardPage() {
  const { user } = useUser();
  const role = user?.role as UserRole | undefined ?? 'admin';

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'patron':
        return <PatronMatronDashboard role="patron" />;
      case 'matron':
        return <PatronMatronDashboard role="matron" />;
      case 'secretary':
        return <SecretaryDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return <div className="space-y-8">{renderDashboard()}</div>;
}
