'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, doc, query, where } from 'firebase/firestore';
import { UserPlus, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { useActiveTerm } from '@/hooks/use-active-term';
import { isPast, parseISO } from 'date-fns';

const OutstandingFeesAlert = () => {
    const { activeTermId, loading: loadingTerm } = useActiveTerm();
    const firestore = useFirestore();

    // Get active term details
    const activeTermQuery = (firestore && activeTermId && activeTermId.includes('_')) 
        ? doc(firestore, 'academicYears', activeTermId.split('_')[0], 'terms', activeTermId.split('_')[1]) 
        : null;
    const [termDetails, loadingTermDetails] = useDocumentData(activeTermQuery);

    // Get students for the active term
    const studentsQuery = (firestore && activeTermId) 
        ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) 
        : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    const isLoading = loadingTerm || loadingTermDetails || loadingStudents;

    if (isLoading) {
        return (
            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Checking for Fee Alerts...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }
    
    if (!activeTermId) {
        // Don't render anything if there's no active term.
        return null;
    }
    
    const deadline = termDetails?.paymentDeadline;
    const studentsWithOutstandingFees = studentsSnapshot?.docs.filter(doc => doc.data().feesPaid < doc.data().totalFees).length || 0;

    // Show alert if:
    // 1. There are students with outstanding fees, AND
    // 2. Either the deadline has passed OR no deadline has been set yet.
    if (studentsWithOutstandingFees === 0 || (deadline && !isPast(parseISO(deadline)))) {
        return null;
    }
    
    const alertTitle = deadline ? "Overdue Payment Alert" : "Outstanding Fee Alert";
    const alertDescription = deadline 
        ? `The payment deadline of ${new Date(deadline).toLocaleDateString()} has passed.`
        : "A payment deadline has not been set for the active term.";


    return (
        <Card className="bg-destructive/10 border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    {alertTitle}
                </CardTitle>
                 <CardDescription className="text-destructive/90 dark:text-red-400/80">
                    {alertDescription}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-destructive/90 dark:text-red-400/90">
                    There are <span className="font-bold">{studentsWithOutstandingFees} students</span> with outstanding fee payments.
                </p>
                <Link href="/dashboard/secretary/reports" passHref className='mt-4 block'>
                    <Button variant="destructive">View Report</Button>
                </Link>
            </CardContent>
        </Card>
    )
}

export default function SecretaryDashboard() {
    const firestore = useFirestore();
    const { activeTermId } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
    const [studentsSnapshot, loading] = useCollection(studentsQuery);

    const totalStudents = studentsSnapshot?.docs.length || 0;

    return (
        <div className='space-y-8'>
            <OutstandingFeesAlert />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enroll Student</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Add a new student to the school registry for the active term.</p>
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
                        <p className="text-sm text-muted-foreground mb-4">See a list of all currently enrolled students by class for the active term.</p>
                         <Link href="/dashboard/secretary/students" passHref>
                          <Button>View Student List</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
            <div>
              <Card>
                  <CardHeader>
                      <CardTitle>Total Students (Active Term)</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalStudents}</div>
                      <p className="text-xs text-muted-foreground">
                          students currently enrolled.
                      </p>
                  </CardContent>
              </Card>
            </div>
        </div>
    );
}
