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
import { UserPlus, BookOpen, AlertTriangle, Loader2, FileText, Settings, ArrowRight } from 'lucide-react';
import { useActiveTerm } from '@/hooks/use-active-term';
import { isPast, parseISO } from 'date-fns';

const OutstandingFeesAlert = () => {
    const { activeTermId, loading: loadingTerm } = useActiveTerm();
    const firestore = useFirestore();

    const activeTermQuery = (firestore && activeTermId && activeTermId.includes('_')) 
        ? doc(firestore, 'academicYears', activeTermId.split('_')[0], 'terms', activeTermId.split('_')[1]) 
        : null;
    const [termDetails, loadingTermDetails] = useDocumentData(activeTermQuery);
    
    const studentsQuery = (firestore && activeTermId) 
        ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) 
        : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    const isLoading = loadingTerm || loadingTermDetails || loadingStudents;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Checking for fee alerts...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!activeTermId) {
        return null;
    }
    
    const deadline = termDetails?.paymentDeadline;
    const studentsWithOutstandingFees = studentsSnapshot?.docs.filter(doc => doc.data().feesPaid < doc.data().totalFees).length || 0;

    if (studentsWithOutstandingFees === 0 || (deadline && !isPast(parseISO(deadline)))) {
        return null;
    }
    
    const alertTitle = deadline && isPast(parseISO(deadline)) ? "Overdue Payment Alert" : "Outstanding Fee Alert";
    const alertDescription = deadline && isPast(parseISO(deadline))
        ? `The payment deadline of ${new Date(deadline).toLocaleDateString()} has passed.`
        : "A payment deadline has not been set for the active term.";


    return (
        <Card className="bg-destructive/10 border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-6 p-6">
                <div className="hidden md:block bg-destructive/20 p-4 rounded-full">
                     <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-1">
                     <CardTitle className="flex items-center gap-2 text-destructive dark:text-red-400">
                        <AlertTriangle className="h-6 w-6 md:hidden" />
                        {alertTitle}
                    </CardTitle>
                    <CardDescription className="text-destructive/90 dark:text-red-400/80">
                        {alertDescription}
                    </CardDescription>
                    <p className="text-destructive/90 dark:text-red-400/90 pt-2">
                        There are <span className="font-bold text-lg">{studentsWithOutstandingFees} students</span> with outstanding fee payments.
                    </p>
                </div>
                <Link href="/dashboard/secretary/reports" passHref className='mt-4 md:mt-0'>
                    <Button variant="destructive">View Report</Button>
                </Link>
            </div>
        </Card>
    )
}

const ActionCard = ({ title, description, icon: Icon, href }: { title: string, description: string, icon: React.ElementType, href: string }) => (
    <Card className="group hover:shadow-md transition-shadow">
        <Link href={href} className="flex items-center gap-6 p-6">
            <div className="p-3 bg-muted rounded-lg">
                 <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
    </Card>
)

export default function SecretaryDashboard() {
    const firestore = useFirestore();
    const { activeTermId } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
    const [studentsSnapshot, loading] = useCollection(studentsQuery);

    const totalStudents = studentsSnapshot?.docs.length || 0;

    return (
        <div className='space-y-8'>
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Secretary Dashboard</h1>
                    <p className="text-muted-foreground">Your central hub for administrative tasks.</p>
                </div>
            </div>

            <OutstandingFeesAlert />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                      <CardTitle>Total Students (Active Term)</CardTitle>
                      <CardDescription>The number of students currently enrolled.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="text-5xl font-bold">{loading ? <Loader2 className="h-10 w-10 animate-spin" /> : totalStudents}</div>
                  </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Jump to your most common tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-center space-y-4">
                        <ActionCard title="Enroll New Student" description="Add a new student to the registry." icon={UserPlus} href="/dashboard/secretary/students/add" />
                        <ActionCard title="Manage Students" description="View and update student records." icon={BookOpen} href="/dashboard/secretary/students" />
                        <ActionCard title="View Reports" description="Generate financial and enrollment reports." icon={FileText} href="/dashboard/secretary/reports" />
                        <ActionCard title="Configure Settings" description="Manage academic years and fees." icon={Settings} href="/dashboard/secretary/settings" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
