'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { materials } from '@/lib/data';

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
)

export default function ReportsPage() {
    const firestore = useFirestore();
    const [studentsSnapshot, loading] = useCollection(
        firestore ? collection(firestore, 'students') : null
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const students = studentsSnapshot?.docs.map(doc => doc.data()) || [];
    const totalStudents = students.length;
    const totalFeesPaid = students.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
    const totalFeesExpected = students.reduce((acc, s) => acc + (s.totalFees || 0), 0);
    const feesPaidPercentage = totalFeesExpected > 0 ? (totalFeesPaid / totalFeesExpected) * 100 : 0;
    const outstandingFees = totalFeesExpected - totalFeesPaid;

    const boys = students.filter(s => s.gender === 'male').length;
    const girls = students.filter(s => s.gender === 'female').length;

    const studentsWithOutstandingFees = students.filter(s => s.feesPaid < s.totalFees).length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">School Reports</h1>
                    <p className="text-muted-foreground">An overview of student and financial metrics.</p>
                </div>
            </div>

            {/* Enrollment Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Summary</CardTitle>
                    <CardDescription>Breakdown of the student population.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                   <StatCard title="Total Students" value={totalStudents} icon={Users} />
                   <StatCard title="Male Students" value={boys} icon={Users} />
                   <StatCard title="Female Students" value={girls} icon={Users} />
                </CardContent>
            </Card>

            {/* Financial Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Financial Report</CardTitle>
                    <CardDescription>Summary of school fee collections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <StatCard title="Total Fees Expected" value={`RWF ${totalFeesExpected.toLocaleString()}`} icon={DollarSign} />
                        <StatCard title="Total Fees Collected" value={`RWF ${totalFeesPaid.toLocaleString()}`} icon={DollarSign} />
                        <StatCard title="Outstanding Balance" value={`RWF ${outstandingFees.toLocaleString()}`} icon={AlertCircle} />
                    </div>
                     <div>
                        <p className="text-sm font-medium mb-2">Fee Collection Progress</p>
                        <Progress value={feesPaidPercentage} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{feesPaidPercentage.toFixed(1)}% collected</span>
                            <span>{studentsWithOutstandingFees} students with outstanding fees</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
