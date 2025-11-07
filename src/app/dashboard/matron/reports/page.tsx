
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, Loader2, BookOpen } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { materials } from '@/lib/data';
import { useActiveTerm } from '@/hooks/use-active-term';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, description, color }: { title: string, value: string | number, icon: React.ElementType, description?: string, color: 'blue' | 'orange' }) => {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-500/10',
        orange: 'text-orange-500 bg-orange-500/10',
    };
    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}

export default function ReportsPage() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId), where('gender', '==', 'female')) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    if (loadingTerm || loadingStudents) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    const studentsToMonitor = studentsSnapshot?.docs
        .map(doc => doc.data()) || [];

    const totalStudents = studentsToMonitor.length;

    const requiredMaterialsCount = materials.filter(m => m.required).length;
    const utilitiesMissing = studentsToMonitor.reduce((totalMissing, student) => {
        const presentCount = student.utilities?.filter((u: any) => u.status === 'present').length || 0;
        return totalMissing + (requiredMaterialsCount - presentCount);
    }, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Matron's Reports
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    An overview of metrics for female students under your care for the active term.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Students Monitored" 
                    value={totalStudents} 
                    icon={Users} 
                    description="Total number of female students."
                    color="blue"
                />
                <StatCard 
                    title="Total Missing Items" 
                    value={utilitiesMissing} 
                    icon={ClipboardList} 
                    description="Across all female students."
                    color="orange"
                />
                 <StatCard 
                    title="Required Materials" 
                    value={requiredMaterialsCount} 
                    icon={BookOpen} 
                    description="Essential items per student"
                    color="orange"
                />
            </div>
        </motion.div>
    );
}
