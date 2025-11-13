'use client';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Pencil, Users, BedDouble, Search, Phone, UserCircle, Sparkles, Filter } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, DocumentData, query, where } from 'firebase/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { EditStudentForm } from './(components)/edit-student-form';
import { AssignDormForm } from './(components)/assign-dorm-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface StudentData extends DocumentData {
  id: string;
  name: string;
  class: string;
  location: string;
  religion: string;
  dormitoryBed?: number;
}

interface StudentListByClassProps {
  students: StudentData[];
  onEdit: (student: StudentData) => void;
  onAssignBed: (student: StudentData) => void;
  searchQuery: string;
}

const StudentListByClass = ({ students, onEdit, onAssignBed, searchQuery }: StudentListByClassProps) => {
  const studentsByClass = students.reduce((acc, student) => {
    const { class: studentClass } = student;
    if (!acc[studentClass]) {
      acc[studentClass] = [];
    }
    acc[studentClass].push(student);
    return acc;
  }, {} as Record<string, StudentData[]>);

  const sortedClasses = Object.keys(studentsByClass).sort();

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue={sortedClasses[0]}>
      {sortedClasses.map((className, idx) => (
        <motion.div
            key={className}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
        >
        <AccordionItem value={className} className="border-b-0 mb-4 overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <AccordionTrigger className="p-5 text-lg font-semibold hover:no-underline hover:bg-accent/50 transition-colors group">
            <div className="flex items-center gap-4 w-full">
                <motion.div 
                    className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/10 rounded-xl border border-pink-500/20"
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <Users className="h-5 w-5 text-pink-500" />
                </motion.div>
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{className}</span>
                        <Badge variant="secondary" className="bg-pink-500/10 text-pink-600 border-pink-500/20">
                            {studentsByClass[className].length} {studentsByClass[className].length === 1 ? 'student' : 'students'}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {studentsByClass[className].filter(s => s.dormitoryBed).length} assigned to dormitory
                    </p>
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-gradient-to-br from-accent/20 to-accent/5 p-4 space-y-3">
            {studentsByClass[className].map((student, studentIdx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: studentIdx * 0.03 }}
                className="p-4 rounded-lg bg-card/70 backdrop-blur-sm border border-border/50 hover:border-pink-500/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 border-2 border-pink-500/20 group-hover/row:border-pink-500/40 transition-colors">
                      <AvatarFallback className="bg-gradient-to-br from-pink-500/20 to-purple-500/10 text-pink-600 font-semibold">
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate">{student.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {student.religion || 'N/A'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <UserCircle className="h-3 w-3" />
                          {student.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Info - Hidden on mobile */}
                  <div className="hidden lg:block flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.parentName || 'N/A'}</p>
                    {student.parentPhone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {student.parentPhone}
                      </p>
                    )}
                  </div>

                  {/* Dormitory Status */}
                  <div className="flex items-center gap-2 lg:justify-end">
                    {student.dormitoryBed ? (
                      <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/20 hover:bg-pink-500/20">
                        <BedDouble className="h-3 w-3 mr-1" />
                        Bed {student.dormitoryBed}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-500/20 text-orange-600">
                        Unassigned
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 lg:ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onAssignBed(student)} 
                      title="Assign Bed"
                      className="hover:bg-pink-500/10 hover:text-pink-600"
                    >
                      <BedDouble className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(student)} 
                      title="Edit Student"
                      className="hover:bg-pink-500/10 hover:text-pink-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AccordionContent>
        </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  );
};

const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color,
    index 
}: { 
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: 'pink' | 'purple' | 'rose';
    index: number;
}) => {
    const colorClasses = {
        pink: 'text-pink-500 bg-gradient-to-br from-pink-500/20 to-pink-600/5 border-pink-500/20',
        purple: 'text-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/20',
        rose: 'text-rose-500 bg-gradient-to-br from-rose-500/20 to-rose-600/5 border-rose-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <motion.div 
                    className={`p-3 rounded-xl ${colorClasses[color]} border`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <Icon className="h-6 w-6" />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default function StudentsPage() {
  const firestore = useFirestore();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();
  const [searchQuery, setSearchQuery] = useState('');
  const [religionFilter, setReligionFilter] = useState('all');
  const [dormFilter, setDormFilter] = useState('all');

  const studentsQuery = firestore && activeTermId 
    ? query(
        collection(firestore, 'students'), 
        where('termId', '==', activeTermId),
        where('gender', '==', 'female')
      ) 
    : null;
  const [students, loading, error] = useCollectionData(studentsQuery, { idField: 'id' });

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDormFormOpen, setIsDormFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  const studentData = (students as StudentData[]) || [];
  
  const religions = useMemo(() => {
    return [...new Set(studentData.map(s => s.religion).filter(Boolean))];
  }, [studentData]);

  const filteredStudents = useMemo(() => {
    return studentData.filter(student => {
      const matchesSearch = searchQuery === '' || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.parentName && student.parentName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesReligion = religionFilter === 'all' || student.religion === religionFilter;
      
      const matchesDorm = dormFilter === 'all' || 
        (dormFilter === 'assigned' && student.dormitoryBed) ||
        (dormFilter === 'unassigned' && !student.dormitoryBed);
      
      return matchesSearch && matchesReligion && matchesDorm;
    });
  }, [studentData, searchQuery, religionFilter, dormFilter]);

  const studentsWithBeds = studentData.filter(s => s.dormitoryBed).length;
  const classes = [...new Set(studentData.map(s => s.class))].length;

  const handleEdit = (student: StudentData) => {
    setSelectedStudent(student);
    setIsEditFormOpen(true);
  };

  const handleAssignBed = (student: StudentData) => {
    setSelectedStudent(student);
    setIsDormFormOpen(true);
  }
  
  const handleUpdate = () => {
    setSelectedStudent(null);
    setIsEditFormOpen(false);
    setIsDormFormOpen(false);
  }

  const hasActiveFilters = searchQuery || religionFilter !== 'all' || dormFilter !== 'all';

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
              Female Students
            </h1>
            <Badge variant="secondary" className="mt-2 bg-pink-500/10 text-pink-600 border-pink-500/20">
              Student Management
            </Badge>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Comprehensive student information and management for the active term.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Students" 
            value={studentData.length} 
            icon={Users} 
            color="pink"
            index={0}
          />
          <StatCard 
            title="Dormitory Assigned" 
            value={studentsWithBeds} 
            icon={BedDouble} 
            color="purple"
            index={1}
          />
          <StatCard 
            title="Classes" 
            value={classes} 
            icon={Sparkles} 
            color="rose"
            index={2}
          />
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 pointer-events-none" />
          <CardHeader className="relative z-10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-b border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <Sparkles className="h-7 w-7 text-pink-500"/>
                  Student Directory
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Search, filter, and manage student records
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {/* Filters */}
          <div className="relative z-10 p-6 bg-gradient-to-br from-accent/20 to-accent/5 border-b border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-border/50"
                />
              </div>
              
              <Select value={religionFilter} onValueChange={setReligionFilter}>
                <SelectTrigger className="h-11 bg-background/50 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="Filter by religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Religions</SelectItem>
                  {religions.map(r => (
                    <SelectItem key={r} value={r}>
                      {r} ({studentData.filter(s => s.religion === r).length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dormFilter} onValueChange={setDormFilter}>
                <SelectTrigger className="h-11 bg-background/50 backdrop-blur-sm border-border/50">
                  <SelectValue placeholder="Filter by dormitory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="assigned">Dormitory Assigned</SelectItem>
                  <SelectItem value="unassigned">Not Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {hasActiveFilters && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Showing {filteredStudents.length} of {studentData.length} students
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSearchQuery('');
                    setReligionFilter('all');
                    setDormFilter('all');
                  }}
                  className="ml-auto"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>

          <CardContent className="relative z-10 p-6">
            {(loading || loadingTerm) && (
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">Loading students...</p>
              </div>
            )}
            
            {error && (
              <div className="p-8 text-center">
                <p className="text-destructive">Error loading students: {error.message}</p>
              </div>
            )}
            
            {!(loading || loadingTerm) && !error && (
              <AnimatePresence mode="wait">
                {filteredStudents.length > 0 ? (
                  <StudentListByClass 
                    students={filteredStudents} 
                    onEdit={handleEdit} 
                    onAssignBed={handleAssignBed}
                    searchQuery={searchQuery}
                  />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-xl bg-gradient-to-br from-pink-500/5 to-purple-500/5"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Users className="mx-auto h-16 w-16 mb-4 text-pink-500/50"/>
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">
                      {hasActiveFilters ? 'No Results Found' : 'No Students Found'}
                    </h3>
                    <p className="mt-2 max-w-md mx-auto">
                      {hasActiveFilters 
                        ? "No students match your search criteria. Try adjusting your filters."
                        : activeTermId 
                          ? "No female students found for the active term." 
                          : "No active term set. Please set an active term in the settings."
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </CardContent>
          
          <CardFooter className="relative z-10 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-t border-border/50">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {!loading && (
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} 
                    {hasActiveFilters && ` (filtered from ${studentData.length})`}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-500/20">
                Active Term
              </Badge>
            </div>
          </CardFooter>
        </Card>
        </motion.div>
      </div>

      {selectedStudent && (
        <EditStudentForm
          isOpen={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
          student={selectedStudent}
          onUpdate={handleUpdate}
        />
      )}

      {selectedStudent && (
        <AssignDormForm
          isOpen={isDormFormOpen}
          onOpenChange={setIsDormFormOpen}
          student={selectedStudent}
          allStudents={studentData}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}