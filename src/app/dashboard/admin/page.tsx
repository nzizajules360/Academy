
'use client';
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
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, ClipboardList, ArrowRight, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const RecentEnrollments = ({ students }: { students: DocumentData[] }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle>Recent Enrollments</CardTitle>
      <CardDescription>The 5 most recently added students for the active term.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {students.slice(0, 5).map(student => (
          <div key={student.id} className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.class}</p>
            </div>
            <div className="text-sm text-muted-foreground">{student.gender}</div>
          </div>
        ))}
      </div>
    </CardContent>
    <CardFooter>
      <Button asChild className="w-full" variant="outline">
        <Link href="/dashboard/admin/students">
          View All Students <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

const StatCard = ({ title, value, icon: Icon, description, color, link }: { title: string, value: string | number, icon: React.ElementType, description?: string, color: string, link: string }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
        <Link href={link}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`rounded-full p-2 ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Link>
    </Card>
)

export default function AdminDashboard() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();
    
    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    const materialsQuery = firestore ? collection(firestore, 'materials') : null;
    const [materials, loadingMaterials] = useCollectionData(materialsQuery, { idField: 'id' });

    
    if (loadingStudents || loadingTerm || loadingMaterials) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    const students = studentsSnapshot?.docs.map(doc => doc.data()) || [];
    const totalStudents = students.length;
    const totalFeesPaid = students.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
    const totalFeesExpected = students.reduce((acc, s) => acc + (s.totalFees || 0), 0);
    const feesPaidPercentage = totalFeesExpected > 0 ? (totalFeesPaid / totalFeesExpected) * 100 : 0;
    
    const requiredMaterialsCount = materials?.filter((m: any) => m.required).length || 0;
    const utilitiesMissing = students.reduce((totalMissing, student) => {
        const presentCount = student.utilities?.filter((u: any) => u.status === 'present').length || 0;
        return totalMissing + (requiredMaterialsCount - presentCount);
    }, 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">A complete overview of your school's operations.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Total Students" 
                    value={totalStudents} 
                    icon={Users} 
                    description="In the active term"
                    color="bg-blue-500"
                    link="/dashboard/admin/students"
                />
                <StatCard 
                    title="Fee Collection" 
                    value={`RWF ${totalFeesPaid.toLocaleString()}`} 
                    icon={DollarSign} 
                    description={`${feesPaidPercentage.toFixed(0)}% of RWF ${totalFeesExpected.toLocaleString()}`}
                    color="bg-green-500"
                    link="/dashboard/admin/reports"
                />
                <StatCard 
                    title="Utilities Status" 
                    value={`${utilitiesMissing} missing`}
                    icon={ClipboardList} 
                    description="Across all boarding students"
                    color="bg-orange-500"
                    link="/dashboard/admin/utilities"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Overview</CardTitle>
                            <CardDescription>A summary of fee collection progress for the active term.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Fee Collection Progress</p>
                                <Progress value={feesPaidPercentage} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>RWF {totalFeesPaid.toLocaleString()} collected</span>
                                    <span>RWF {(totalFeesExpected - totalFeesPaid).toLocaleString()} outstanding</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <RecentEnrollments students={studentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data()})) || []} />
                </div>
            </div>
      </div>
  );
}
