'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, Loader2 } from 'lucide-react';
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
    
    const genderToMonitor = 'male';
    const studentsToMonitor = studentsSnapshot?.docs
        .map(doc => doc.data())
        .filter(s => s.gender === genderToMonitor) || [];

    const totalStudents = studentsToMonitor.length;

    const requiredMaterialsCount = materials.filter(m => m.required).length;
    const utilitiesMissing = studentsToMonitor.reduce((totalMissing, student) => {
        const presentCount = student.utilities?.filter((u: any) => u.status === 'present').length || 0;
        return totalMissing + (requiredMaterialsCount - presentCount);
    }, 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Patron Reports</h1>
                    <p className="text-muted-foreground">An overview of metrics for students under your care.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard title="Students Monitored" value={totalStudents} icon={Users} description="Total number of male students." />
                <StatCard title="Total Missing Items" value={utilitiesMissing} icon={ClipboardList} description="Across all male students."/>
            </div>
        </div>
    );
}
