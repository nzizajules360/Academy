'use client';

import { useFirestore } from '@/firebase';
import { collection, query, where, DocumentData } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BedDouble, Users, Shield, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

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
    color: 'blue' | 'cyan' | 'indigo' | 'sky';
    index: number;
}) => {
    const colorClasses = {
        blue: 'text-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/20',
        cyan: 'text-cyan-500 bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
        indigo: 'text-indigo-500 bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
        sky: 'text-sky-500 bg-gradient-to-br from-sky-500/20 to-sky-600/5 border-sky-500/20',
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
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default function DormitoryPage() {
    const firestore = useFirestore();
    const { activeTermId, loading: loadingTerm } = useActiveTerm();
    const [searchQuery, setSearchQuery] = useState('');

    const studentsQuery = firestore && activeTermId ? query(
        collection(firestore, 'students'),
        where('termId', '==', activeTermId),
        where('gender', '==', 'male')
    ) : null;

    const [students, loadingStudents] = useCollectionData(studentsQuery);

    const beds = useMemo(() => {
        return (students || [])
            .filter(student => student.dormitoryBed != null)
            .reduce((acc, student) => {
                const bedNumber = student.dormitoryBed;
                if (!bedNumber) return acc;
                if (!acc[bedNumber]) {
                    acc[bedNumber] = [];
                }
                acc[bedNumber].push(student);
                return acc;
            }, {} as Record<number, DocumentData[]>);
    }, [students]);

    const sortedBeds = useMemo(() => {
        const entries = Object.entries(beds).sort(([a], [b]) => Number(a) - Number(b));
        
        if (!searchQuery.trim()) return entries;
        
        return entries.filter(([bedNumber, assignedStudents]) => {
            const query = searchQuery.toLowerCase();
            return (
                bedNumber.includes(query) ||
                assignedStudents.some(s => 
                    s.name.toLowerCase().includes(query) ||
                    s.class.toLowerCase().includes(query)
                )
            );
        });
    }, [beds, searchQuery]);

    const totalBeds = sortedBeds.length;
    const totalStudents = sortedBeds.reduce((sum, [, students]) => sum + students.length, 0);
    const fullBeds = sortedBeds.filter(([, students]) => students.length === 2).length;
    const occupancyRate = totalBeds > 0 ? Math.round((totalStudents / (totalBeds * 2)) * 100) : 0;

    const isLoading = loadingTerm || loadingStudents;

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="h-12 w-12 text-primary" />
                </motion.div>
                <p className="text-muted-foreground">Loading dormitory data...</p>
            </div>
        );
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
                        className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20"
                    >
                        <BedDouble className="h-8 w-8 text-blue-500" />
                    </motion.div>
                    <div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 bg-clip-text text-transparent">
                            Male Dormitory
                        </h1>
                        <Badge variant="secondary" className="mt-2 bg-blue-500/10 text-blue-600 border-blue-500/20">
                            Live Occupancy View
                        </Badge>
                    </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-3xl">
                    Real-time overview of bed assignments and dormitory occupancy for male students.
                </p>
            </motion.div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Beds" 
                        value={totalBeds} 
                        icon={BedDouble} 
                        description="Assigned dormitory beds"
                        color="blue"
                        index={0}
                    />
                    <StatCard 
                        title="Students Housed" 
                        value={totalStudents} 
                        icon={Users} 
                        description="Currently in dormitory"
                        color="cyan"
                        index={1}
                    />
                    <StatCard 
                        title="Full Beds" 
                        value={fullBeds} 
                        icon={CheckCircle2} 
                        description="At maximum capacity"
                        color="indigo"
                        index={2}
                    />
                    <StatCard 
                        title="Occupancy Rate" 
                        value={`${occupancyRate}%`}
                        icon={Shield} 
                        description="Overall bed utilization"
                        color="sky"
                        index={3}
                    />
                </div>

                {totalBeds > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                            <CardContent className="p-6">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Search by bed number, student name, or class..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-4 pr-4 h-12 text-base bg-background/50 backdrop-blur-sm"
                                    />
                                    {searchQuery && (
                                        <Badge 
                                            variant="secondary" 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500/10 text-blue-600 border-blue-500/20"
                                        >
                                            {sortedBeds.length} {sortedBeds.length === 1 ? 'result' : 'results'}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {sortedBeds.length === 0 && !searchQuery ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                            <CardContent className="relative z-10 p-16 text-center">
                                <motion.div
                                    animate={{ 
                                        y: [0, -10, 0],
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <BedDouble className="mx-auto h-16 w-16 mb-4 text-blue-500/50"/>
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-2">No Beds Assigned</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    No male students have been assigned to dormitory beds for the active term yet.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : sortedBeds.length === 0 && searchQuery ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                            <CardContent className="relative z-10 p-16 text-center">
                                <AlertCircle className="mx-auto h-16 w-16 mb-4 text-muted-foreground/50"/>
                                <h3 className="text-2xl font-bold mb-2">No Results Found</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    No beds match your search criteria. Try different keywords.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedBeds.map(([bedNumber, assignedStudents], index) => {
                            const isFull = assignedStudents.length === 2;
                            const hasVacancy = assignedStudents.length === 1;
                            
                            return (
                                <motion.div
                                    key={bedNumber}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 h-full group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        <CardHeader className="relative z-10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-border/50">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-3">
                                                    <motion.div 
                                                        className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20"
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        <BedDouble className="h-5 w-5 text-blue-500"/>
                                                    </motion.div>
                                                    <span className="text-xl">Bed #{bedNumber}</span>
                                                </CardTitle>
                                            </div>
                                            <CardDescription className="mt-2">
                                                <Badge 
                                                    variant={isFull ? "default" : "secondary"}
                                                    className={isFull 
                                                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                                        : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                                    }
                                                >
                                                    {isFull ? (
                                                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Full</>
                                                    ) : (
                                                        <><AlertCircle className="h-3 w-3 mr-1" /> {2 - assignedStudents.length} vacancy</>
                                                    )}
                                                </Badge>
                                                <span className="ml-2 text-xs">
                                                    {assignedStudents.length} / 2 Occupants
                                                </span>
                                            </CardDescription>
                                        </CardHeader>
                                        
                                        <CardContent className="relative z-10 p-6 space-y-4">
                                            {assignedStudents.map((s, idx) => (
                                                <motion.div 
                                                    key={s.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 + idx * 0.1 }}
                                                    className="flex items-center gap-4 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-blue-500/30 transition-colors"
                                                >
                                                    <Avatar className="h-12 w-12 border-2 border-blue-500/20">
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 font-semibold">
                                                            {s.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold truncate">{s.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {s.class}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                </motion.div>
                                            ))}
                                            
                                            {hasVacancy && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="p-3 rounded-lg bg-muted/30 border border-dashed border-border/50 text-center"
                                                >
                                                    <p className="text-sm text-muted-foreground">1 space available</p>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}