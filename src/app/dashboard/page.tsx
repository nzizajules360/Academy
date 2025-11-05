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
import { students } from '@/lib/data';
import { DollarSign, Users, ClipboardList, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/types';

type DashboardPageProps = {
  searchParams: {
    role?: UserRole;
  };
};

const totalStudents = students.length;
const boardingStudents = students.filter(s => s.type === 'boarding').length;
const externalStudents = students.filter(s => s.type === 'external').length;
const totalFeesPaid = students.reduce((acc, s) => acc + s.feesPaid, 0);
const totalFeesExpected = students.reduce((acc, s) => acc + s.totalFees, 0);
const feesPaidPercentage = (totalFeesPaid / totalFeesExpected) * 100;

const utilitiesMissing = students.flatMap(s => s.utilities.filter(u => u.status === 'missing')).length;
const patronStudents = students.filter(s => s.gender === 'male' && s.type === 'boarding');
const matronStudents = students.filter(s => s.gender === 'female' && s.type === 'boarding');
const patronUtilitiesMissing = patronStudents.flatMap(s => s.utilities.filter(u => u.status === 'missing')).length;
const matronUtilitiesMissing = matronStudents.flatMap(s => s.utilities.filter(u => u.status === 'missing')).length;


const RecentEnrollments = () => (
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
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.slice(0, 5).map(student => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell>
                <Badge variant={student.type === 'boarding' ? 'default' : 'secondary'}>
                  {student.type}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const AdminDashboard = () => (
  <>
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            {boardingStudents} boarding, {externalStudents} external
          </p>
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
    <RecentEnrollments />
  </>
);

const PatronMatronDashboard = ({ role }: { role: 'patron' | 'matron' }) => {
  const studentCount = role === 'patron' ? patronStudents.length : matronStudents.length;
  const missingCount = role === 'patron' ? patronUtilitiesMissing : matronUtilitiesMissing;
  const studentsToMonitor = role === 'patron' ? patronStudents : matronStudents;
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
                .filter(s => s.utilities.some(u => u.status === 'missing'))
                .slice(0, 5)
                .map(student => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.utilities.filter(u => u.status === 'missing').length}</TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
};

const SecretaryDashboard = () => (
    <>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                    {boardingStudents} boarding, {externalStudents} external
                </p>
                </CardContent>
            </Card>
        </div>
        <RecentEnrollments/>
    </>
);


export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const role = searchParams.role ?? 'admin';

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
