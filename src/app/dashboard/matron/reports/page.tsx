
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, Loader2, BookOpen, FileDown, BedDouble, TrendingUp, AlertCircle, CheckCircle2, Download, Sparkles } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import Papa from 'papaparse';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    color,
    trend,
    index 
}: { 
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    color: 'pink' | 'purple' | 'rose' | 'violet';
    trend?: { value: number; label: string };
    index: number;
}) => {
    const colorClasses = {
        pink: 'text-pink-500 bg-gradient-to-br from-pink-500/20 to-pink-600/5 border-pink-500/20',
        purple: 'text-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/20',
        rose: 'text-rose-500 bg-gradient-to-br from-rose-500/20 to-rose-600/5 border-rose-500/20',
        violet: 'text-violet-500 bg-gradient-to-br from-violet-500/20 to-violet-600/5 border-violet-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <motion.div 
                        className={`p-3 rounded-xl ${colorClasses[color]} border backdrop-blur-sm`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Icon className="h-5 w-5" />
                    </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <motion.div 
                        className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    >
                        {value}
                    </motion.div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">
                                {trend.value > 0 ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-xs text-muted-foreground">{trend.label}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ExportCard = ({
    icon: Icon,
    title,
    description,
    buttonText,
    onExport,
    children,
    color
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    buttonText: string;
    onExport: () => void;
    children?: React.ReactNode;
    color: 'pink' | 'purple';
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onExport();
        setIsExporting(false);
    };

    const colorClasses = {
        pink: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
        purple: 'from-purple-500/10 to-violet-500/10 border-purple-500/20',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative p-6 border rounded-xl bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm overflow-hidden group`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                        <h4 className="font-semibold text-lg">{title}</h4>
                        <p className="text-sm text-muted-foreground">{description}</p>
                        {children}
                    </div>
                </div>
                <Button 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                    size="lg"
                >
                    <AnimatePresence mode="wait">
                        {isExporting ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </motion.div>
                        ) : (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4 group-hover/btn:animate-bounce" />
                                {buttonText}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </div>
        </motion.div>
    );
};

const InsightCard = ({ 
    icon: Icon, 
    title, 
    value, 
    status,
    color 
}: { 
    icon: React.ElementType;
    title: string;
    value: string | number;
    status: 'good' | 'warning' | 'info';
    color: string;
}) => {
    const statusConfig = {
        good: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        warning: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        info: { icon: AlertCircle, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    };

    const StatusIcon = statusConfig[status].icon;

    return (
        <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center gap-4 p-4 rounded-lg bg-card/30 border border-border/50 backdrop-blur-sm"
        >
            <div className={`p-3 rounded-lg ${statusConfig[status].bg}`}>
                <Icon className={`h-5 w-5 ${statusConfig[status].color}`} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-lg font-semibold">{value}</p>
            </div>
            <StatusIcon className={`h-5 w-5 ${statusConfig[status].color}`} />
        </motion.div>
    );
};

export default function ReportsPage() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();
    const [religionFilter, setReligionFilter] = useState('all');

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId), where('gender', '==', 'female')) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);
    
    const materialsQuery = firestore ? collection(firestore, 'materials') : null;
    const [materials, loadingMaterials] = useCollectionData(materialsQuery, { idField: 'id' });

    if (loadingTerm || loadingStudents || loadingMaterials) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
        );
    }
    
    const students = studentsSnapshot?.docs.map(doc => doc.data()) || [];
    const totalStudents = students.length;
    const religions = [...new Set(students.map(s => s.religion).filter(Boolean))];

    const requiredMaterialsCount = materials?.filter((m: any) => m.required).length || 0;
    const utilitiesMissing = students.reduce((totalMissing, student) => {
        const presentCount = student.utilities?.filter((u: any) => u.status === 'present').length || 0;
        return totalMissing + (requiredMaterialsCount - presentCount);
    }, 0);

    const studentsWithBeds = students.filter(s => s.dormitoryBed).length;
    const completionRate = totalStudents > 0 ? Math.round((studentsWithBeds / totalStudents) * 100) : 0;

    const handleDormitoryExport = () => {
        const dataToExport = students
            .filter(s => s.dormitoryBed)
            .map(s => ({
                "Student Name": s.name,
                "Class": s.class,
                "Bed Number": s.dormitoryBed,
            }))
            .sort((a, b) => a["Bed Number"] - b["Bed Number"]);

        if (dataToExport.length === 0) {
            alert("No students with dormitory assignments to export.");
            return;
        }

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `female_dormitory_assignments_${new Date().toISOString().split('T')[0]}.csv`);
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
        link.setAttribute('download', `female_students_${religionFilter}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-3 mb-8"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/10 border border-pink-500/20"
                    >
                        <Sparkles className="h-8 w-8 text-pink-500" />
                    </motion.div>
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                            Matron's Reports
                        </h1>
                        <Badge variant="secondary" className="mt-2 bg-pink-500/10 text-pink-600 border-pink-500/20">
                            Active Term Dashboard
                        </Badge>
                    </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-3xl">
                    Comprehensive analytics and insights for female students under your supervision.
                </p>
            </motion.div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Students" 
                        value={totalStudents} 
                        icon={Users} 
                        description="Female students monitored"
                        color="pink"
                        index={0}
                    />
                    <StatCard 
                        title="Missing Items" 
                        value={utilitiesMissing} 
                        icon={ClipboardList} 
                        description="Across all students"
                        color="rose"
                        index={1}
                    />
                    <StatCard 
                        title="Required Materials" 
                        value={requiredMaterialsCount} 
                        icon={BookOpen} 
                        description="Per student checklist"
                        color="violet"
                        index={2}
                    />
                    <StatCard 
                        title="Bed Assignments" 
                        value={`${completionRate}%`}
                        icon={BedDouble} 
                        description={`${studentsWithBeds} of ${totalStudents} assigned`}
                        color="purple"
                        index={3}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5" />
                        <CardHeader className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/10">
                                    <TrendingUp className="h-5 w-5 text-pink-500" />
                                </div>
                                <CardTitle className="text-2xl font-bold">Quick Insights</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                Key metrics and statistics at a glance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InsightCard
                                icon={Users}
                                title="Religious Diversity"
                                value={`${religions.length} ${religions.length === 1 ? 'religion' : 'religions'}`}
                                status="info"
                                color="pink"
                            />
                            <InsightCard
                                icon={BedDouble}
                                title="Dormitory Status"
                                value={`${studentsWithBeds} assigned`}
                                status={completionRate === 100 ? "good" : "warning"}
                                color="purple"
                            />
                            <InsightCard
                                icon={ClipboardList}
                                title="Avg. Missing Items"
                                value={totalStudents > 0 ? (utilitiesMissing / totalStudents).toFixed(1) : '0'}
                                status={utilitiesMissing === 0 ? "good" : "warning"}
                                color="rose"
                            />
                            <InsightCard
                                icon={BookOpen}
                                title="Completion Rate"
                                value={`${totalStudents > 0 ? Math.round(((totalStudents * requiredMaterialsCount - utilitiesMissing) / (totalStudents * requiredMaterialsCount)) * 100) : 0}%`}
                                status="info"
                                color="violet"
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5" />
                        <CardHeader className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                                    <FileDown className="h-6 w-6 text-pink-500" />
                                </div>
                                <CardTitle className="text-3xl font-bold">Export Center</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                Download comprehensive reports and data exports for analysis and record-keeping
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
                            <ExportCard
                                icon={BedDouble}
                                title="Dormitory Assignments Report"
                                description="Complete list of students with their assigned bed numbers, sorted for easy reference"
                                buttonText="Export Dormitory CSV"
                                onExport={handleDormitoryExport}
                                color="pink"
                            >
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-pink-500/10 text-pink-600 border-pink-500/20">
                                        {studentsWithBeds} students
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">with assignments</span>
                                </div>
                            </ExportCard>

                            <ExportCard
                                icon={Users}
                                title="Student Directory"
                                description="Comprehensive student list with filtering options by religious affiliation"
                                buttonText="Export Student CSV"
                                onExport={handleStudentExport}
                                color="purple"
                            >
                                <div className="mt-3 flex items-center gap-2">
                                    <Select value={religionFilter} onValueChange={setReligionFilter}>
                                        <SelectTrigger className="w-[200px] bg-background/50 backdrop-blur-sm">
                                            <SelectValue placeholder="Filter by religion" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Religions ({totalStudents})</SelectItem>
                                            {religions.map(r => (
                                                <SelectItem key={r} value={r}>
                                                    {r} ({students.filter(s => s.religion === r).length})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {religionFilter !== 'all' && (
                                        <Badge variant="outline" className="border-purple-500/20 text-purple-600">
                                            {students.filter(s => s.religion === religionFilter).length} students
                                        </Badge>
                                    )}
                                </div>
                            </ExportCard>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
