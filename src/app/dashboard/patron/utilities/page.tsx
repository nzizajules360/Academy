
'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { materials } from '@/lib/data';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronDown, Loader2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useActiveTerm } from '@/hooks/use-active-term';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function UtilitiesPage() {
  const firestore = useFirestore();
  const genderToDisplay = 'male';
  const { activeTermId, loading: loadingTerm } = useActiveTerm();
  
  const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId), where('gender', '==', genderToDisplay)) : null;
  const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

  const relevantStudents = studentsSnapshot?.docs
    .map(doc => ({id: doc.id, ...doc.data()}));

  const handleUtilityChange = async (studentId: string, materialId: string, checked: boolean) => {
    if (!firestore) return;
    const studentRef = doc(firestore, 'students', studentId);
    const utility = { materialId, status: checked ? 'present' : 'missing' };
    
    try {
        const studentDoc = relevantStudents?.find(s => s.id === studentId);
        if (!studentDoc) return;
        const existingUtility = studentDoc.utilities?.find((u: any) => u.materialId === materialId);

        if (existingUtility) {
             await updateDoc(studentRef, {
                utilities: arrayRemove(existingUtility)
            });
        }
       
        await updateDoc(studentRef, {
            utilities: arrayUnion(utility)
        });

    } catch (error) {
        console.error("Error updating utility: ", error);
    }
  };

  const getStatus = (student: any, materialId: string) => {
    return student.utilities?.find((u: any) => u.materialId === materialId)?.status === 'present';
  };

  const getPresentCount = (student: any) => {
    return student.utilities?.filter((u: any) => u.status === 'present').length || 0;
  }
  
  const requiredMaterialsCount = materials.filter(m => m.required).length;

  if (loadingTerm || loadingStudents) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-b">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-blue-500" />
            Male Student Utilities
        </CardTitle>
        <CardDescription className="text-base">
          Monitor and manage the status of materials for each male boarding student.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="p-6 font-semibold">Student</TableHead>
                        <TableHead className="font-semibold">Class</TableHead>
                        <TableHead className="text-right p-6 font-semibold">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {relevantStudents?.map(student => (
                    <Collapsible asChild key={student.id} tag="tr">
                       <React.Fragment>
                            <TableRow className="border-t">
                                <TableCell className="font-medium p-6">{student.name}</TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell className="text-right p-6">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <span className="mr-2">
                                                <Badge variant={getPresentCount(student) < requiredMaterialsCount ? "destructive" : "secondary"}>
                                                    {getPresentCount(student)}/{requiredMaterialsCount} Present
                                                </Badge>
                                            </span>
                                            <ChevronDown className="h-4 w-4" />
                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </TableCell>
                            </TableRow>
                            <CollapsibleContent asChild>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableCell colSpan={3} className="p-0">
                                        <div className="p-6">
                                            <h4 className="font-semibold mb-4 text-base">Required Materials for {student.name}</h4>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                            {materials.filter(m => m.required).map(material => (
                                                <div key={material.id} className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`${student.id}-${material.id}`}
                                                        checked={getStatus(student, material.id)}
                                                        onCheckedChange={(checked) => handleUtilityChange(student.id, material.id, !!checked)}
                                                        className="h-5 w-5"
                                                    />
                                                    <label
                                                    htmlFor={`${student.id}-${material.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                    {material.name}
                                                    </label>
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </CollapsibleContent>
                        </React.Fragment>
                    </Collapsible>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
