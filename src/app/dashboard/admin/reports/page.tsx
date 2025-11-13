
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, ClipboardList, AlertCircle, Loader2, FileDown, TrendingUp, Calendar, BookOpen, CreditCard } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Enhanced Stat Card with animations
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  color = "blue"
}: { 
  title: string, 
  value: string | number, 
  icon: React.ElementType, 
  description?: string,
  trend?: number,
  color?: "blue" | "green" | "red" | "purple" | "orange"
}) => {
  const colorClasses = {
    blue: {
        gradient: "from-blue-500/5 to-purple-500/5",
        text: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    green: {
        gradient: "from-green-500/5 to-emerald-500/5",
        text: "text-green-500",
        bg: "bg-green-500/10"
    },
    red: {
        gradient: "from-red-500/5 to-orange-500/5",
        text: "text-red-500",
        bg: "bg-red-500/10"
    },
    purple: {
        gradient: "from-purple-500/5 to-fuchsia-500/5",
        text: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    orange: {
        gradient: "from-orange-500/5 to-amber-500/5",
        text: "text-orange-500",
        bg: "bg-orange-500/10"
    }
  };

  const selectedColor = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group bg-gradient-to-br ${selectedColor.gradient}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${selectedColor.bg} group-hover:scale-110 transition-transform`}>
            <Icon className={`h-4 w-4 ${selectedColor.text}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{value}</div>
          <div className="flex items-center justify-between">
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend !== undefined && (
              <Badge 
                variant={trend >= 0 ? "default" : "destructive"} 
                className="text-xs"
              >
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Progress Bar with animation
const AnimatedProgress = ({ value, className = "" }: { value: number; className?: string }) => {
    return (
        <Progress value={value} className={cn("h-3", className)} />
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
        const dataToExport = studentsWithOutstandingFees.map(s => ({
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

    const totalOutstanding = studentsWithOutstandingFees.reduce((sum: number, student: DocumentData) => 
        sum + (student.totalFees - student.feesPaid), 0
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border-b">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                                Outstanding Fees Report
                            </CardTitle>
                            <CardDescription className="text-base">
                                Students with incomplete fee payments for the active term
                                {totalOutstanding > 0 && (
                                    <Badge variant="destructive" className="ml-2">
                                        RWF {totalOutstanding.toLocaleString()} Total Outstanding
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        onClick={handleExport} 
                                        disabled={studentsWithOutstandingFees.length === 0}
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Download detailed report as CSV</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                        {studentsWithOutstandingFees.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-green-600 mb-2">All Fees Collected!</h3>
                                <p className="text-muted-foreground">No outstanding fees for the current term.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Accordion type="single" collapsible className="w-full" defaultValue={sortedClasses[0]}>
                                    {sortedClasses.map((className, index) => (
                                        <motion.div
                                            key={className}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <AccordionItem value={className} className="border rounded-lg mb-3 hover:shadow-md transition-shadow">
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                    <div className="flex items-center justify-between w-full pr-4">
                                                        <span className="font-semibold text-lg">{className}</span>
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant="secondary" className="text-sm">
                                                                {studentsByClass[className].length} students
                                                            </Badge>
                                                            <Badge variant="destructive" className="text-sm">
                                                                RWF {studentsByClass[className].reduce((sum: number, s: DocumentData) => sum + (s.totalFees - s.feesPaid), 0).toLocaleString()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-0">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="font-semibold">Student Name</TableHead>
                                                                <TableHead className="font-semibold hidden sm:table-cell">Parent Contact</TableHead>
                                                                <TableHead className="text-right font-semibold">Outstanding Balance</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {studentsByClass[className].map((student: DocumentData, idx: number) => (
                                                                <motion.tr
                                                                    key={student.id}
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    className="hover:bg-muted/50 transition-colors"
                                                                >
                                                                    <TableCell className="font-medium">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`h-2 w-2 rounded-full ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                                                                            <div>
                                                                                <p>{student.name}</p>
                                                                                <div className="text-muted-foreground text-sm sm:hidden">
                                                                                    {student.parentName} ({student.parentPhone})
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="hidden sm:table-cell">
                                                                        <div>
                                                                            <div className="font-medium">{student.parentName}</div>
                                                                            <div className="text-sm text-muted-foreground">{student.parentPhone}</div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge variant="destructive" className="text-sm px-3 py-1">
                                                                            RWF {(student.totalFees - student.feesPaid).toLocaleString()}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </motion.tr>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </motion.div>
                                    ))}
                                </Accordion>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function ReportsPage() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm, activeTerm } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);
    
    const materialsQuery = firestore ? collection(firestore, 'materials') : null;
    const [materials, loadingMaterials] = useCollectionData(materialsQuery, { idField: 'id' });

    if (loadingTerm || loadingStudents || loadingMaterials) {
        return (
            <div className="flex justify-center items-center h-64">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="h-8 w-8 text-primary" />
                </motion.div>
            </div>
        );
    }

    const students = studentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data()})) || [];
    const totalStudents = students.length;
    const totalFeesPaid = students.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
    const totalFeesExpected = students.reduce((acc, s) => acc + (s.totalFees || 0), 0);
    const feesPaidPercentage = totalFeesExpected > 0 ? (totalFeesPaid / totalFeesExpected) * 100 : 0;
    const outstandingFees = totalFeesExpected - totalFeesPaid;

    const requiredMaterialsCount = materials?.filter((m: any) => m.required).length || 0;
    const utilitiesMissing = students.reduce((totalMissing, student) => {
        const presentCount = student.utilities?.filter((u: any) => u.status === 'present').length || 0;
        return totalMissing + (requiredMaterialsCount - presentCount);
    }, 0);

    const boys = students.filter(s => s.gender === 'male').length;
    const girls = students.filter(s => s.gender === 'female').length;
    const boysPercentage = totalStudents > 0 ? (boys / totalStudents) * 100 : 0;
    const girlsPercentage = totalStudents > 0 ? (girls / totalStudents) * 100 : 0;

    const studentsWithOutstandingFees = students.filter(s => s.feesPaid < s.totalFees).length;
    
    return (
        <TooltipProvider>
            <div className="space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Comprehensive Reports
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Real-time overview of school metrics, financial performance, and student analytics
                    </p>
                    {activeTerm && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 rounded-lg px-3 py-2 w-fit">
                            <Calendar className="h-4 w-4" />
                            <span>Active Term: <strong>{(activeTerm as DocumentData).name}</strong></span>
                        </div>
                    )}
                </motion.div>

                {/* Enrollment Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-b">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <Users className="h-6 w-6 text-blue-500" />
                                Enrollment Summary
                            </CardTitle>
                            <CardDescription className="text-base">
                                Current student population and demographic breakdown
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <StatCard 
                                    title="Total Students" 
                                    value={totalStudents} 
                                    icon={Users} 
                                    description="Currently enrolled"
                                    color="blue"
                                />
                                <StatCard 
                                    title="Male Students" 
                                    value={boys} 
                                    icon={Users} 
                                    description={`${boysPercentage.toFixed(1)}% of total`}
                                    color="blue"
                                />
                                <StatCard 
                                    title="Female Students" 
                                    value={girls} 
                                    icon={Users} 
                                    description={`${girlsPercentage.toFixed(1)}% of total`}
                                    color="purple"
                                />
                            </div>
                            
                            {/* Gender Distribution Visualization */}
                            {totalStudents > 0 && (
                                <div className="mt-6 p-4 bg-accent/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Gender Distribution</span>
                                        <span className="text-sm text-muted-foreground">100%</span>
                                    </div>
                                    <div className="flex h-4 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${boysPercentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="bg-blue-500"
                                        />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${girlsPercentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="bg-pink-500"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>Boys: {boysPercentage.toFixed(1)}%</span>
                                        <span>Girls: {girlsPercentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Financial Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-b">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-green-500" />
                                Financial Report
                            </CardTitle>
                            <CardDescription className="text-base">
                                Fee collection performance and outstanding balances
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <StatCard 
                                    title="Total Fees Expected" 
                                    value={`RWF ${totalFeesExpected.toLocaleString()}`} 
                                    icon={DollarSign} 
                                    color="green"
                                />
                                <StatCard 
                                    title="Total Fees Collected" 
                                    value={`RWF ${totalFeesPaid.toLocaleString()}`} 
                                    icon={TrendingUp} 
                                    color="green"
                                />
                                <StatCard 
                                    title="Outstanding Balance" 
                                    value={`RWF ${outstandingFees.toLocaleString()}`} 
                                    icon={AlertCircle} 
                                    color="red"
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Fee Collection Progress</p>
                                    <span className="text-sm font-semibold text-green-600">
                                        {feesPaidPercentage.toFixed(1)}% Complete
                                    </span>
                                </div>
                                <AnimatedProgress value={feesPaidPercentage} className="h-3 [&>div]:bg-green-500" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>RWF 0</span>
                                    <span>RWF {totalFeesExpected.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-green-600">
                                        {students.length - studentsWithOutstandingFees} students paid
                                    </span>
                                    <span className="text-red-600">
                                        {studentsWithOutstandingFees} students pending
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Utilities Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border-b">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-orange-500" />
                                Utilities Report
                            </CardTitle>
                            <CardDescription className="text-base">
                                Learning materials and resource tracking
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <StatCard 
                                    title="Total Missing Items" 
                                    value={utilitiesMissing} 
                                    icon={ClipboardList} 
                                    description="Across all students for required materials"
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
                            
                            {utilitiesMissing > 0 && (
                                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            Action Required: {utilitiesMissing} items missing across student utilities
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Outstanding Fees Report */}
                <OutstandingFeesReport students={students} />
            </div>
        </TooltipProvider>
    );
}
