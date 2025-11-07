'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, AlertCircle, Loader2, FileDown, Table } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

    return (
         <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Outstanding Fees Report</CardTitle>
                        <CardDescription>List of students with incomplete fee payments for the active term.</CardDescription>
                    </div>
                    <Button onClick={handleExport} disabled={studentsWithOutstandingFees.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export to CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {studentsWithOutstandingFees.length === 0 ? (
                    <p className="text-muted-foreground">No students with outstanding fees.</p>
                ) : (
                    <Accordion type="single" collapsible className="w-full" defaultValue={sortedClasses[0]}>
                        {sortedClasses.map(className => (
                            <AccordionItem value={className} key={className}>
                                <AccordionTrigger>{className} ({studentsByClass[className].length} students)</AccordionTrigger>
                                <AccordionContent>
                                    <UiTable>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Parent Contact</TableHead>
                                                <TableHead className="text-right">Outstanding Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {studentsByClass[className].map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-medium">{student.name}</TableCell>
                                                    <TableCell>{student.parentName} ({student.parentPhone})</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="destructive">
                                                            RWF {(student.totalFees - student.feesPaid).toLocaleString()}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </UiTable>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </CardContent>
        </Card>
    )
}

const RefectoryReport = ({ students }: { students: DocumentData[] }) => {
    const unassignedStudents = students.filter(s => !s.refectoryTableMorning || !s.refectoryTableEvening).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Refectory Assignment Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <StatCard 
                    title="Unassigned Students" 
                    value={unassignedStudents} 
                    icon={AlertCircle} 
                    description="Students without a full table assignment for both meals."
                />
            </CardContent>
        </Card>
    )
}

export default function ReportsPage() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();

    const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
    const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

    if (loadingTerm || loadingStudents) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">School Reports</h1>
                    <p className="text-muted-foreground">An overview of student and financial metrics for the active term.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enrollment Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                   <StatCard title="Total Students" value={totalStudents} icon={Users} />
                   <StatCard title="Male Students" value={boys} icon={Users} />
                   <StatCard title="Female Students" value={girls} icon={Users} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Financial Report</CardTitle>
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

            <RefectoryReport students={students} />

            <OutstandingFeesReport students={students} />
        </div>
    );
}
