'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { UserPlus, BookOpen } from 'lucide-react';


export default function SecretaryDashboard() {
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
                        <Link href="/dashboard/secretary/students/add" passHref>
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
                         <Link href="/dashboard/secretary/students" passHref>
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
