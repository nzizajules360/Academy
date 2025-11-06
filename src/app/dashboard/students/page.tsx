
'use client';
import Link from 'next/link';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { students } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import type { UserRole } from '@/types';
import { useUser } from '@/firebase';

export default function StudentsPage() {
  const { user } = useUser();
  const role = user?.role as UserRole | undefined ?? 'admin';
  const canAddStudents = role === 'secretary' || role === 'admin';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Students</CardTitle>
                <CardDescription>Manage student records, view details, and track enrollment.</CardDescription>
            </div>
            {canAddStudents && (
            <Link href={`/dashboard/students/add`} passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </Link>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fees Paid</TableHead>
              <TableHead>Refectory Table</TableHead>
              <TableHead>Parent Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>
                  <Badge variant={student.type === 'boarding' ? 'default' : 'secondary'}>
                    {student.type}
                  </Badge>
                </TableCell>
                <TableCell>
                    ${student.feesPaid.toLocaleString()} / ${student.totalFees.toLocaleString()}
                </TableCell>
                <TableCell>{student.refectoryTable}</TableCell>
                <TableCell>
                    <div>{student.parentName}</div>
                    <div className="text-sm text-muted-foreground">{student.parentPhone}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{students.length}</strong> of <strong>{students.length}</strong> students
        </div>
      </CardFooter>
    </Card>
  );
}
