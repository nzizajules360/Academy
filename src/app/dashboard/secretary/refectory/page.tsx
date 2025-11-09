
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SeatingChart, RefectoryTable, EnrolledStudent } from '@/types/refectory';
import { generateSeatingChart } from '@/lib/seating-chart-generator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Download, Undo, Loader2, Table as TableIcon, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useTermManager } from '@/hooks/use-term-manager';
import { useFirestore } from '@/firebase';
import { writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DocumentData } from 'firebase/firestore';

// Enhanced Student Avatar with animations
const StudentAvatar = ({ student, index }: { student: EnrolledStudent; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
  >
    <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
      student.gender === 'male' 
        ? 'bg-blue-500 shadow-lg shadow-blue-500/25' 
        : 'bg-pink-500 shadow-lg shadow-pink-500/25'
    }`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
        {student.fullName}
      </p>
      <p className="text-xs text-muted-foreground truncate">{student.class}</p>
    </div>
  </motion.div>
);

// Enhanced Table Card with glassmorphism and animations
const TableCard = ({ table, index }: { table: RefectoryTable; index: number }) => {
  const boyCapacity = 3;
  const girlCapacity = 7;
  const boysNeeded = boyCapacity - table.boys.length;
  const girlsNeeded = girlCapacity - table.girls.length;
  const boysPercentage = (table.boys.length / boyCapacity) * 100;
  const girlsPercentage = (table.girls.length / girlCapacity) * 100;
  const totalStudents = table.boys.length + table.girls.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Header with gradient */}
        <CardHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <TableIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Table {table.tableNumber}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="font-semibold">
                    Serie {table.serie}
                  </Badge>
                  <span className="text-xs">• {totalStudents} students</span>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4 flex-grow">
          <div className="space-y-4">
            {/* Boys Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <p className="text-sm font-semibold text-blue-600">Boys</p>
                </div>
                <p className="text-sm font-medium">{table.boys.length}/{boyCapacity}</p>
              </div>
              <Progress 
                value={boysPercentage} 
                className="h-3 bg-blue-100 [&>div]:bg-blue-500 [&>div]:shadow-lg [&>div]:shadow-blue-500/25"
              />
              <AnimatePresence>
                {boysNeeded > 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-blue-600 font-medium"
                  >
                    {boysNeeded} more needed
                  </motion.p>
                )}
                {boysNeeded === 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-600 font-medium"
                  >
                    ✓ Full capacity
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Girls Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  <p className="text-sm font-semibold text-pink-600">Girls</p>
                </div>
                <p className="text-sm font-medium">{table.girls.length}/{girlCapacity}</p>
              </div>
              <Progress 
                value={girlsPercentage} 
                className="h-3 bg-pink-100 [&>div]:bg-pink-500 [&>div]:shadow-lg [&>div]:shadow-pink-500/25"
              />
              <AnimatePresence>
                {girlsNeeded > 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-pink-600 font-medium"
                  >
                    {girlsNeeded} more needed
                  </motion.p>
                )}
                {girlsNeeded === 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-600 font-medium"
                  >
                    ✓ Full capacity
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>

        {/* Student List */}
        {(table.boys.length > 0 || table.girls.length > 0) && (
          <CardFooter className="p-0">
            <ScrollArea className="h-40 w-full">
              <div className="p-4 space-y-1">
                <AnimatePresence>
                  {table.boys.map((student, i) => (
                    <StudentAvatar key={`boy-${student.id}-${i}`} student={student} index={i} />
                  ))}
                  {table.girls.map((student, i) => (
                    <StudentAvatar 
                      key={`girl-${student.id}-${i}`} 
                      student={student} 
                      index={table.boys.length + i} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, description, color }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="bg-gradient-to-br from-background to-accent/5 border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function SeatingChartPage() {
  const { enrolledStudents, loading, activeTerm } = useTermManager();
  const [seatingChart, setSeatingChart] = useState<SeatingChart | null>(null);
  const [previousSeatingChart, setPreviousSeatingChart] = useState<SeatingChart | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);

  const handleGenerateChart = useCallback(() => {
    if (enrolledStudents && enrolledStudents.length > 0) {
      setPreviousSeatingChart(seatingChart);
      const newChart = generateSeatingChart(enrolledStudents, seatingChart || undefined);
      setSeatingChart(newChart);
      
      toast({
        title: "Chart Generated",
        description: "New seating arrangement has been created successfully.",
      });
    }
  }, [enrolledStudents, seatingChart, toast]);

  const handleUndo = () => {
    if (previousSeatingChart) {
      setSeatingChart(previousSeatingChart);
      setPreviousSeatingChart(null);
      toast({
        title: "Changes Reverted",
        description: "Previous seating arrangement restored.",
      });
    }
  };

  useEffect(() => {
    if (enrolledStudents && enrolledStudents.length > 0 && !seatingChart) {
      handleGenerateChart();
    }
  }, [enrolledStudents, seatingChart, handleGenerateChart]);

  const handleSaveAssignments = async () => {
    if (!firestore || !seatingChart || !enrolledStudents) {
      toast({ variant: 'destructive', title: 'Error', description: 'System not ready.' });
      return;
    }
    setIsAssigning(true);
    try {
      const batch = writeBatch(firestore);
      const studentAssignments = new Map<string, { morning?: number; evening?: number }>();

      const processTables = (tables: RefectoryTable[], shift: 'morning' | 'evening') => {
        tables.forEach(table => {
          [...table.boys, ...table.girls].forEach(student => {
            if (student.id) {
              if (!studentAssignments.has(student.id)) {
                studentAssignments.set(student.id, {});
              }
              const assignment = studentAssignments.get(student.id)!;
              if (shift === 'morning') {
                assignment.morning = table.tableNumber;
              } else {
                assignment.evening = table.tableNumber;
              }
            }
          });
        });
      };

      processTables(seatingChart.morning, 'morning');
      processTables(seatingChart.evening, 'evening');
      
      studentAssignments.forEach((assignments, studentId) => {
        const studentRef = doc(firestore, 'students', studentId);
        const updateData: { refectoryTableMorning?: number | null, refectoryTableEvening?: number | null } = {};
        if (assignments.morning) updateData.refectoryTableMorning = assignments.morning;
        if (assignments.evening) updateData.refectoryTableEvening = assignments.evening;
        batch.update(studentRef, updateData);
      });

      await batch.commit();
      toast({
        title: "Success!",
        description: "Seating assignments have been saved to the database.",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to save assignments. Please try again.' 
      });
    } finally {
      setIsAssigning(false);
    }
  };

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
        data.push([`Table Number: ${table.tableNumber}`]);
        merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 2 } });
        rowIndex++;

        data.push(['Gender', 'Student Name', 'Class']);
        rowIndex++;

        const allStudentsInTable = [
          ...table.girls.map(s => ({ ...s, genderLabel: 'Girl' })),
          ...table.boys.map(s => ({ ...s, genderLabel: 'Boy' }))
        ];

        allStudentsInTable.forEach(student => {
          data.push([student.genderLabel, student.fullName, (student as EnrolledStudent).class]);
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
    
    const sheetName = `${shift === 'morning' ? 'Morning' : 'Evening'}${serie ? ` - Serie ${serie}` : ''}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    const fileName = `seating_${shift}${serie ? `_serie_${serie}` : ''}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Export Complete",
      description: `Excel file has been downloaded successfully.`,
    });
  };

  const renderShift = (tables: RefectoryTable[], shiftName: 'morning' | 'evening') => {
    if (!tables || tables.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-xl"
        >
          <Users className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">No seating chart available</p>
          <p className="mt-2">Generate a chart to see the table assignments</p>
        </motion.div>
      );
    }

    const serie1Tables = tables.filter(t => t.serie === 1);
    const serie2Tables = tables.filter(t => t.serie === 2);

    return (
      <div className="space-y-8">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-accent/10 rounded-lg">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Serie 1 Tables
              </h3>
              <p className="text-muted-foreground mt-1">{serie1Tables.length} tables assigned</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => handleExcelExport(shiftName, 1)} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 sm:mt-0"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Serie 1
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Excel file for Serie 1</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {serie1Tables.map((table, index) => (
              <TableCard key={table.tableNumber} table={table} index={index} />
            ))}
          </motion.div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-accent/10 rounded-lg">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Serie 2 Tables
              </h3>
              <p className="text-muted-foreground mt-1">{serie2Tables.length} tables assigned</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => handleExcelExport(shiftName, 2)} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 sm:mt-0"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Serie 2
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Excel file for Serie 2</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {serie2Tables.map((table, index) => (
              <TableCard key={table.tableNumber} table={table} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
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

    if (!enrolledStudents || enrolledStudents.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-xl"
        >
          <Users className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-semibold">No students enrolled for the selected term</p>
          <p className="mt-2 text-sm">Select another term or enroll students to generate a seating chart</p>
          <Link href="/dashboard/secretary/students/add">
            <Button className="mt-6" size="lg">
              Enroll Students
            </Button>
          </Link>
        </motion.div>
      );
    }

    if (!seatingChart) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground py-16"
        >
          <TableIcon className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">Ready to generate seating chart</p>
          <p className="mt-2">Click the button below to create table assignments</p>
        </motion.div>
      );
    }

    return (
      <Tabs defaultValue="morning" className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-accent/20 rounded-lg">
          <TabsTrigger 
            value="morning" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
          >
            🌅 Morning & Lunch 
            <Badge variant="secondary" className="ml-1">
              {seatingChart.morning.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="evening" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all"
          >
            🌙 Evening
            <Badge variant="secondary" className="ml-1">
              {seatingChart.evening.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="morning" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="morning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderShift(seatingChart.morning, 'morning')}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
        
        <TabsContent value="evening" className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="evening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderShift(seatingChart.evening, 'evening')}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    );
  };

  // Calculate statistics
  const totalStudents = enrolledStudents?.length || 0;
  const totalTables = seatingChart ? seatingChart.morning.length + seatingChart.evening.length : 0;
  const assignedStudents = seatingChart ? 
    seatingChart.morning.reduce((acc, table) => acc + table.boys.length + table.girls.length, 0) +
    seatingChart.evening.reduce((acc, table) => acc + table.boys.length + table.girls.length, 0) : 0;

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Refectory Seating
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Automatically assign seats to students with intelligent table distribution and real-time updates.
            </p>
            {activeTerm && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Active Term: {(activeTerm as DocumentData).name}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleUndo} 
                  variant="outline" 
                  disabled={!previousSeatingChart}
                  className="gap-2"
                >
                  <Undo className="h-4 w-4" />
                  Undo
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Revert to previous arrangement</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleGenerateChart} 
                  disabled={loading || !enrolledStudents || enrolledStudents.length === 0}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate Chart
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create new seating arrangement</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleSaveAssignments} 
                  disabled={isAssigning || !seatingChart}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Save Assignments
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save assignments to database</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {enrolledStudents && enrolledStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <StatsCard
              title="Total Students"
              value={totalStudents}
              icon={Users}
              description="Enrolled in current term"
              color="text-blue-500"
            />
            <StatsCard
              title="Total Tables"
              value={totalTables}
              icon={TableIcon}
              description="Across both shifts"
              color="text-green-500"
            />
            <StatsCard
              title="Assigned Seats"
              value={assignedStudents}
              icon={User}
              description="Students with table assignments"
              color="text-purple-500"
            />
          </motion.div>
        )}

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <TableIcon className="h-6 w-6 text-primary" />
                Seat Assignments
              </CardTitle>
              <CardDescription className="text-base">
                Tables are automatically filled with optimal distribution: up to 3 boys and 7 girls per table.
                Students are intelligently grouped by class and series for better organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
