
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, Loader2, BookOpen, FileDown, BedDouble } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { materials } from '@/lib/data';
import { useActiveTerm } from '@/hooks/use-active-term';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import Papa from 'papaparse';

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
    const [religionFilter, setReligionFilter] = useState('all');

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId), where('gender', '==', 'male')) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    if (loadingTerm || loadingStudents) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    const students = studentsSnapshot?.docs.map(doc => doc.data()) || [];

    const totalStudents = students.length;
    const religions = [...new Set(students.map(s => s.religion).filter(Boolean))];

    const requiredMaterialsCount = materials.filter(m => m.required).length;
    const utilitiesMissing = students.reduce((totalMissing, student) => {
        const presentCount = student.utilities?.filter((u: any) => u.status === 'present').length || 0;
        return totalMissing + (requiredMaterialsCount - presentCount);
    }, 0);

    const handleDormitoryExport = () => {
        const dataToExport = students
            .filter(s => s.dormitoryBed)
            .map(s => ({
                "Student Name": s.name,
                "Class": s.class,
                "Bed Number": s.dormitoryBed,
            }))
            .sort((a,b) => a["Bed Number"] - b["Bed Number"]);

        if (dataToExport.length === 0) {
            alert("No students with dormitory assignments to export.");
            return;
        }

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `male_dormitory_assignments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleStudentExport = () => {
        const filteredStudents = religionFilter === 'all' 
            ? students 
            : students.filter(s => s.religion === religionFilter);

        if (filteredStudents.length === 0) {
            alert("No students match the selected filter.");
            return;
        }

        const dataToExport = filteredStudents.map(s => ({
            "Student Name": s.name,
            "Class": s.class,
            "Religion": s.religion || 'N/A',
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `male_students_${religionFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Patron's Reports
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    An overview of metrics for male students under your care for the active term.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Students Monitored" 
                    value={totalStudents} 
                    icon={Users} 
                    description="Total number of male students."
                    color="blue"
                />
                <StatCard 
                    title="Total Missing Items" 
                    value={utilitiesMissing} 
                    icon={ClipboardList} 
                    description="Across all male students."
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
             <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <FileDown className="h-6 w-6 text-primary" />
                        Export Center
                    </CardTitle>
                    <CardDescription className="text-base">
                        Download student data in CSV format for analysis and record-keeping.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <BedDouble className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <h4 className="font-semibold">Dormitory Assignments</h4>
                                <p className="text-sm text-muted-foreground">Export a list of students and their assigned bed numbers.</p>
                            </div>
                        </div>
                        <Button onClick={handleDormitoryExport} variant="outline" className="w-full md:w-auto">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export Dormitory CSV
                        </Button>
                    </div>

                     <div className="p-4 border rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <h4 className="font-semibold">Student List</h4>
                                <p className="text-sm text-muted-foreground">Export a list of male students, optionally filtered by religion.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Select value={religionFilter} onValueChange={setReligionFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by religion" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Religions</SelectItem>
                                    {religions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleStudentExport} className="w-full sm:w-auto">
                                <FileDown className="mr-2 h-4 w-4" />
                                Export Student CSV
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
