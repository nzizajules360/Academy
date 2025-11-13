'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, AlertCircle, Loader2, FileDown, TrendingUp, Download, CheckCircle2, BookOpen } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    color,
    index 
}: { 
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
    index: number;
}) => {
    const colorClasses = {
        blue: 'text-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20',
        green: 'text-green-500 bg-gradient-to-br from-green-500/20 to-green-600/5 border-green-500/20',
        orange: 'text-orange-500 bg-gradient-to-br from-orange-500/20 to-orange-600/5 border-orange-500/20',
        purple: 'text-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/20',
        red: 'text-red-500 bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -3 }}
        >
            <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <motion.div 
                        className={`p-2 rounded-xl ${colorClasses[color]} border`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Icon className="h-4 w-4" />
                    </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">{value}</div>
                    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ExportButton = ({ 
    onClick, 
    disabled, 
    children 
}: { 
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleClick = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onClick();
        setIsExporting(false);
    };

    return (
        <Button 
            onClick={handleClick} 
            disabled={disabled || isExporting} 
            variant="outline"
            className="shadow-md hover:shadow-lg transition-all duration-300"
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
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    );
};

const OutstandingFeesReport = ({ students }: { students: DocumentData[] }) => {
    const studentsWithOutstandingFees = students.filter(s => s.feesPaid < s.totalFees);

    const studentsByClass = studentsWithOutstandingFees.reduce((acc, student) => {
        const { class: studentClass } = student;
        if (!acc[studentClass]) {
          acc[studentClass] = [];
        }
        acc[studentClass].push(student);
        return acc;
      }, {} as Record<string, DocumentData[]>);
    
    const sortedClasses = Object.keys(studentsByClass).sort();
    
    const handleExport = () => {
        const dataToExport = studentsWithOutstandingFees.sort((a,b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name)).map(s => ({
            "Student Name": s.name,
            "Class": s.class,
            "Parent Name": s.parentName,
            "Parent Phone": s.parentPhone,
            "Total Fees": s.totalFees,
            "Fees Paid": s.feesPaid,
            "Outstanding Balance": s.totalFees - s.feesPaid,
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `outstanding_fees_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 pointer-events-none" />
                <CardHeader className="relative z-10 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-border/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Outstanding Fees Report</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    Students with incomplete fee payments
                                </CardDescription>
                            </div>
                        </div>
                        <ExportButton onClick={handleExport} disabled={studentsWithOutstandingFees.length === 0}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export Report
                        </ExportButton>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10 p-6">
                    {studentsWithOutstandingFees.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 border-2 border-dashed rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5"
                        >
                            <CheckCircle2 className="mx-auto h-16 w-16 mb-4 text-green-500/50" />
                            <h3 className="text-xl font-semibold mb-2">All Fees Paid!</h3>
                            <p className="text-muted-foreground">No students have outstanding fees.</p>
                        </motion.div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full" defaultValue={sortedClasses[0]}>
                            {sortedClasses.map((className, idx) => (
                                <motion.div
                                    key={className}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <AccordionItem value={className} className="border-b-0 mb-3 overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm">
                                        <AccordionTrigger className="p-4 hover:no-underline hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                                                    {studentsByClass[className].length}
                                                </Badge>
                                                <span className="font-semibold">{className}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 space-y-2">
                                            {studentsByClass[className].map((student, studentIdx) => (
                                                <motion.div
                                                    key={student.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: studentIdx * 0.03 }}
                                                    className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-red-500/30 transition-colors"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold">{student.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {student.parentName} • {student.parentPhone}
                                                            </p>
                                                        </div>
                                                        <Badge variant="destructive" className="self-start sm:self-center whitespace-nowrap">
                                                            RWF {(student.totalFees - student.feesPaid).toLocaleString()}
                                                        </Badge>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

const RefectoryReport = ({ students }: { students: DocumentData[] }) => {
    const unassignedStudents = students.filter(s => !s.refectoryTableMorning || !s.refectoryTableEvening).length;
    const assignedStudents = students.length - unassignedStudents;

    const handleExport = () => {
        if (!students) return;

        const dataToExport = students.sort((a,b) => a.name.localeCompare(b.name)).map(s => ({
            "Student Name": s.name,
            "Class": s.class,
            "Gender": s.gender,
            "Morning & Lunch Table": s.refectoryTableMorning || 'Unassigned',
            "Evening Table": s.refectoryTableEvening || 'Unassigned',
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `refectory_assignments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none" />
                <CardHeader className="relative z-10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-border/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/20">
                                <BookOpen className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Refectory Assignment Report</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    Dining table assignment summary
                                </CardDescription>
                            </div>
                        </div>
                        <ExportButton onClick={handleExport} disabled={students.length === 0}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export Assignments
                        </ExportButton>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10 p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <StatCard 
                            title="Assigned Students" 
                            value={assignedStudents} 
                            icon={CheckCircle2} 
                            description="Students with complete assignments"
                            color="green"
                            index={0}
                        />
                        <StatCard 
                            title="Unassigned Students" 
                            value={unassignedStudents} 
                            icon={AlertCircle} 
                            description="Missing one or both assignments"
                            color="orange"
                            index={1}
                        />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ReportsPage() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    if (loadingTerm || loadingStudents) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">Loading reports data...</p>
            </div>
        );
    }

    const students = studentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data()})) || [];
    const totalStudents = students.length;
    const totalFeesPaid = students.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
    const totalFeesExpected = students.reduce((acc, s) => acc + (s.totalFees || 0), 0);
    const feesPaidPercentage = totalFeesExpected > 0 ? (totalFeesPaid / totalFeesExpected) * 100 : 0;
    const outstandingFees = totalFeesExpected - totalFeesPaid;

    const boys = students.filter(s => s.gender === 'male').length;
    const girls = students.filter(s => s.gender === 'female').length;

    const studentsWithOutstandingFees = students.filter(s => s.feesPaid < s.totalFees).length;

    const handleStudentExport = () => {
        const dataToExport = students.sort((a,b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name)).map(s => ({
            "Student Name": s.name,
            "Class": s.class,
            "Gender": s.gender,
            "Location": s.location,
            "Parent Name": s.parentName,
            "Parent Phone": s.parentPhone,
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `student_list_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

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
                        className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                    >
                        <TrendingUp className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                            School Reports
                        </h1>
                        <Badge variant="secondary" className="mt-2">
                            Analytics Dashboard
                        </Badge>
                    </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-3xl">
                    Comprehensive overview of enrollment, financial metrics, and operational data for the active term.
                </p>
            </motion.div>

            <div className="space-y-8">
                {/* Enrollment Report */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />
                        <CardHeader className="relative z-10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-border/50">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20">
                                        <Users className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold">Enrollment Report</CardTitle>
                                        <CardDescription className="text-base mt-1">
                                            Student enrollment summary
                                        </CardDescription>
                                    </div>
                                </div>
                                <ExportButton onClick={handleStudentExport} disabled={students.length === 0}>
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Export Student List
                                </ExportButton>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 p-6 grid md:grid-cols-3 gap-4">
                            <StatCard title="Total Students" value={totalStudents} icon={Users} color="blue" index={0} />
                            <StatCard title="Male Students" value={boys} icon={Users} color="blue" index={1} />
                            <StatCard title="Female Students" value={girls} icon={Users} color="purple" index={2} />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Financial Report */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 pointer-events-none" />
                        <CardHeader className="relative z-10 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20">
                                    <DollarSign className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold">Financial Report</CardTitle>
                                    <CardDescription className="text-base mt-1">
                                        Fee collection status and outstanding balances
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10 p-6 space-y-6">
                            <div className="grid md:grid-cols-3 gap-4">
                                <StatCard 
                                    title="Total Fees Expected" 
                                    value={`RWF ${totalFeesExpected.toLocaleString()}`} 
                                    icon={DollarSign} 
                                    color="blue"
                                    index={0}
                                />
                                <StatCard 
                                    title="Total Fees Collected" 
                                    value={`RWF ${totalFeesPaid.toLocaleString()}`} 
                                    icon={DollarSign} 
                                    color="green"
                                    index={1}
                                />
                                <StatCard 
                                    title="Outstanding Balance" 
                                    value={`RWF ${outstandingFees.toLocaleString()}`} 
                                    icon={AlertCircle} 
                                    color="red"
                                    index={2}
                                />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border border-border/50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold">Fee Collection Progress</p>
                                    <Badge variant={feesPaidPercentage === 100 ? "default" : "secondary"} className="bg-green-500/10 text-green-600 border-green-500/20">
                                        {feesPaidPercentage.toFixed(1)}%
                                    </Badge>
                                </div>
                                <Progress value={feesPaidPercentage} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {totalStudents - studentsWithOutstandingFees} students paid in full
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {studentsWithOutstandingFees} with outstanding fees
                                    </span>
                                </div>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                <RefectoryReport students={students} />

                <OutstandingFeesReport students={students} />
            </div>
        </div>
    );
}