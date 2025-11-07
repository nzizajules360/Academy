'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SeatingChart, RefectoryTable, EnrolledStudent } from '@/types/refectory';
import { generateSeatingChart } from '@/lib/seating-chart-generator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Download, Undo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useTermManager } from '@/hooks/use-term-manager';
import { Loader2 } from 'lucide-react';

const StudentAvatar = ({ student }: { student: EnrolledStudent }) => (
    <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
        <p className="text-xs text-muted-foreground truncate">{student.fullName}</p>
    </div>
);


const TableCard = ({ table }: { table: RefectoryTable }) => {
    const boysPercentage = (table.boys.length / 3) * 100;
    const girlsPercentage = (table.girls.length / 7) * 100;

    return (
        <Card className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Ameza {table.tableNumber}</CardTitle>
                    <Badge variant="outline">Serie {table.serie}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium">Abahungu</p>
                            <p className="text-xs text-muted-foreground">{table.boys.length} / 3</p>
                        </div>
                        <Progress value={boysPercentage} className="h-2" />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium">Abakobwa</p>
                            <p className="text-xs text-muted-foreground">{table.girls.length} / 7</p>
                        </div>
                        <Progress value={girlsPercentage} className="h-2 [&>div]:bg-pink-400" />
                    </div>
                </div>
            </CardContent>
             {(table.boys.length > 0 || table.girls.length > 0) && (
                <CardFooter className="p-4 pt-0">
                    <ScrollArea className="h-32 w-full pr-3">
                        <div className="space-y-2">
                           {table.boys.map(s => <StudentAvatar key={s.id} student={s} />)}
                           {table.girls.map(s => <StudentAvatar key={s.id} student={s} />)}
                        </div>
                    </ScrollArea>
                </CardFooter>
            )}
        </Card>
    );
};


export default function SeatingChartPage() {
    const { enrolledStudents, loading } = useTermManager();
    const [seatingChart, setSeatingChart] = useState<SeatingChart | null>(null);
    const [previousSeatingChart, setPreviousSeatingChart] = useState<SeatingChart | null>(null);

    const handleGenerateChart = useCallback(() => {
        if (enrolledStudents && enrolledStudents.length > 0) {
            setPreviousSeatingChart(seatingChart); // Save current chart before regenerating
            setSeatingChart(generateSeatingChart(enrolledStudents, seatingChart || undefined));
        } else {
            setSeatingChart(null);
        }
    }, [enrolledStudents, seatingChart]);

     const handleUndo = () => {
        if (previousSeatingChart) {
            setSeatingChart(previousSeatingChart);
            setPreviousSeatingChart(null); // Can only undo once
        }
    };
    
    useEffect(() => {
        // Automatically generate chart when enrolled students for the selected term are loaded
        if (enrolledStudents && enrolledStudents.length > 0 && !seatingChart) {
            handleGenerateChart();
        }
    }, [enrolledStudents, seatingChart, handleGenerateChart]);
    

    const handleExcelExport = (shift: 'morning' | 'evening', serie?: 1 | 2) => {
        if (!seatingChart) return;
        
        const shiftTables = shift === 'morning' ? seatingChart.morning : seatingChart.evening;
        const tablesToExport = serie ? shiftTables.filter(t => t.serie === serie) : shiftTables;
        
        const wb = XLSX.utils.book_new();

        const processShiftData = (tables: RefectoryTable[]) => {
            const data: (string | number)[][] = [];
            const merges: XLSX.Range[] = [];
            let rowIndex = 0;

            tables.forEach(table => {
                data.push([`Nimero y'Ameza: ${table.tableNumber}`]);
                merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 2 } });
                rowIndex++;

                data.push(['Igitsina', 'Izina ry\'Umunyeshuri', 'Ishuri']);
                rowIndex++;

                const allStudentsInTable = [
                    ...table.girls.map(s => ({ ...s, gender: 'Umukobwa' })),
                    ...table.boys.map(s => ({ ...s, gender: 'Umuhungu' }))
                ];

                allStudentsInTable.forEach(student => {
                    data.push([student.gender, student.fullName, (student as EnrolledStudent).class]);
                    rowIndex++;
                });

                data.push([]);
                rowIndex++;
            });

            return { data, merges };
        };

        const { data, merges } = processShiftData(tablesToExport);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!merges'] = merges;
        
        const sheetName = `${shift === 'morning' ? 'Mu Gitondo' : 'Nimugoroba'}${serie ? ` - Serie ${serie}` : ''}`;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        const fileName = `imyicarire_${shift}${serie ? `_serie_${serie}` : ''}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const renderShift = (tables: RefectoryTable[], shiftName: 'morning' | 'evening') => {
         if (!tables || tables.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-12">
                    <Users className="mx-auto h-12 w-12" />
                    <p className="mt-4">Nta myicarire iraboneka.</p>
                </div>
            );
        }
        const serie1Tables = tables.filter(t => t.serie === 1);
        const serie2Tables = tables.filter(t => t.serie === 2);

        return (
            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xl font-semibold">Ameza ya Serie 1</h3>
                         <Button onClick={() => handleExcelExport(shiftName, 1)} variant="outline" size="sm" disabled={!seatingChart}>
                            <Download className="mr-2 h-4 w-4" />
                            Kohereza Serie 1
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {serie1Tables.map(table => (
                            <TableCard key={table.tableNumber} table={table} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xl font-semibold">Ameza ya Serie 2</h3>
                         <Button onClick={() => handleExcelExport(shiftName, 2)} variant="outline" size="sm" disabled={!seatingChart}>
                            <Download className="mr-2 h-4 w-4" />
                            Kohereza Serie 2
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {serie2Tables.map(table => (
                            <TableCard key={table.tableNumber} table={table} />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
        }
        if (!enrolledStudents || enrolledStudents.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <Users className="mx-auto h-12 w-12" />
                    <p className="mt-4 font-semibold">Nta banyeshuri biyandikishije mu gihembwe cyatoranijwe.</p>
                    <p className="mt-1 text-sm">Hitamo ikindi gihembwe cyangwa wandike abanyeshuri kugira ngo ukore imyicarire.</p>
                    <Link href="/dashboard/secretary/students/add">
                        <Button className="mt-4">Andika Abanyeshuri</Button>
                    </Link>
                </div>
            )
        }
        if (!seatingChart) {
             return (
                <div className="text-center text-muted-foreground py-12">Kanda kuri "Kora Imyicarire" kugira ngo utange imyanya.</div>
            );
        }

        return (
             <Tabs defaultValue="morning">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="morning">🌅 Mu Gitondo ({seatingChart.morning.length} ameza)</TabsTrigger>
                    <TabsTrigger value="evening">🌙 Nimugoroba ({seatingChart.evening.length} ameza)</TabsTrigger>
                </TabsList>
                <TabsContent value="morning" className="mt-6">
                    {renderShift(seatingChart.morning, 'morning')}
                </TabsContent>
                <TabsContent value="evening" className="mt-6">
                    {renderShift(seatingChart.evening, 'evening')}
                </TabsContent>
            </Tabs>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Imyicarire mu Byumba byo Kuriramo</h1>
                    <p className="text-muted-foreground">Gutanga imyanya ku banyeshuri mu buryo bwikora mu gihembwe gikora.</p>
                </div>
                <div className="flex gap-2">
                     <Button onClick={handleUndo} variant="outline" disabled={!previousSeatingChart}>
                        <Undo className="mr-2 h-4 w-4" />
                        Subiza Inyuma
                    </Button>
                    <Button onClick={handleGenerateChart} disabled={loading || !enrolledStudents || enrolledStudents.length === 0}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Kora Imyicarire
                    </Button>
                </div>
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle>Imyanya yatanzwe</CardTitle>
                    <CardDescription>
                        Ameza atangwa kugeza yuzuye, abahungu batatu n'abakobwa barindwi kuri buri meza.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}
