
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, orderBy, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, Search, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent';
};

export default function AttendanceReportPage() {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  
  const [academicYears, setAcademicYears] = useState<DocumentData[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [terms, setTerms] = useState<DocumentData[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [assignedClass, setAssignedClass] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(true);

  // Fetch academic years
  useEffect(() => {
    if (!firestore) return;
    const fetchYears = async () => {
      const yearsQuery = query(collection(firestore, 'academicYears'), orderBy('year', 'desc'));
      const yearsSnapshot = await getDocs(yearsQuery);
      setAcademicYears(yearsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchYears();
  }, [firestore]);

  // Fetch terms when a year is selected
  useEffect(() => {
    if (!firestore || !selectedYear) return;
    const fetchTerms = async () => {
      const termsQuery = query(collection(firestore, 'academicYears', selectedYear, 'terms'), orderBy('name'));
      const termsSnapshot = await getDocs(termsQuery);
      setTerms(termsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchTerms();
  }, [firestore, selectedYear]);

  // Fetch teacher's assigned class
  useEffect(() => {
    if (user && firestore) {
      const fetchAssignment = async () => {
        const q = query(collection(firestore, 'teacherAssignments'), where('teacherId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setAssignedClass(querySnapshot.docs[0].data().class);
        }
        setLoading(false);
      };
      fetchAssignment();
    }
  }, [user, firestore]);

  const handleSearch = async () => {
    if (!firestore || !selectedTerm || !assignedClass) return;
    setLoading(true);

    const termId = `${selectedYear}_${selectedTerm}`;
    let attendanceQuery = query(
      collection(firestore, 'attendanceRecords'),
      where('termId', '==', termId),
      where('class', '==', assignedClass),
      orderBy('date', 'desc'),
      orderBy('studentName')
    );

    if (dateRange?.from) {
      attendanceQuery = query(attendanceQuery, where('date', '>=', format(dateRange.from, 'yyyy-MM-dd')));
    }
    if (dateRange?.to) {
      attendanceQuery = query(attendanceQuery, where('date', '<=', format(dateRange.to, 'yyyy-MM-dd')));
    }

    const snapshot = await getDocs(attendanceQuery);
    setAttendanceData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord)));
    setLoading(false);
  };
  
  const handleExport = () => {
    if (attendanceData.length === 0) return;
    const csv = Papa.unparse(attendanceData.map(d => ({
        Date: d.date,
        'Student Name': d.studentName,
        Status: d.status,
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `attendance_report_${assignedClass}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const groupedData = useMemo(() => {
    return attendanceData.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = [];
      }
      acc[record.date].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);
  }, [attendanceData]);
  
  const sortedDates = Object.keys(groupedData).sort((a,b) => b.localeCompare(a));


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Report for {assignedClass || 'Your Class'}</CardTitle>
          <CardDescription>Filter and view historical attendance records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Select onValueChange={setSelectedYear} value={selectedYear}>
              <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
              <SelectContent>
                {academicYears.map(year => <SelectItem key={year.id} value={year.id}>{year.year}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedTerm} value={selectedTerm} disabled={!selectedYear}>
              <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
              <SelectContent>
                {terms.map(term => <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? `${format(dateRange.from, 'LLL dd, y')} - ${format(dateRange.to, 'LLL dd, y')}` : format(dateRange.from, 'LLL dd, y')
                  ) : <span>Pick a date range</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                 <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                 <div className="p-2 border-t flex flex-col gap-2">
                    <Button onClick={() => setDateRange({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) })} variant="ghost" size="sm" className="w-full justify-start">This Week</Button>
                    <Button onClick={() => setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })} variant="ghost" size="sm" className="w-full justify-start">This Month</Button>
                 </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleSearch} disabled={!selectedTerm || loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />}
                Search
            </Button>
          </div>
          <div className="flex justify-end">
              <Button onClick={handleExport} variant="outline" disabled={attendanceData.length === 0}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Results
              </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

      {!loading && attendanceData.length === 0 && (
          <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                  No attendance records found for the selected criteria.
              </CardContent>
          </Card>
      )}

      {!loading && sortedDates.length > 0 && (
        <div className="space-y-4">
            {sortedDates.map(date => (
                <Card key={date}>
                    <CardHeader>
                        <CardTitle>{format(new Date(date), 'PPPP')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupedData[date].map(record => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.studentName}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </motion.div>
  );
}
