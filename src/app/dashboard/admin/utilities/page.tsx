
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
import { useFirestore } from '@/firebase';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronDown, Loader2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveTerm } from '@/hooks/use-active-term';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function UtilitiesPage() {
  const firestore = useFirestore();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();

  const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
  const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

  const materialsQuery = firestore ? query(collection(firestore, 'materials'), where('required', '==', true)) : null;
  const [materials, loadingMaterials] = useCollectionData(materialsQuery, { idField: 'id' });

  const relevantStudents = studentsSnapshot?.docs.map(doc => ({id: doc.id, ...doc.data()}))
    .filter((student: any) => student.gender === 'male' || student.gender === 'female'); 

  const handleUtilityChange = async (studentId: string, materialId: string, isChecked: boolean) => {
    if (!firestore || !materialId) {
      console.error("Firestore not available or materialId is missing.");
      return;
    }
    const studentRef = doc(firestore, 'students', studentId);

    const utilityToAdd = { materialId, status: 'present' };
    const utilityToRemove = { materialId, status: 'missing' };

    try {
      if (isChecked) {
        // Add 'present' and remove 'missing'
        await updateDoc(studentRef, {
            utilities: arrayUnion(utilityToAdd)
        });
        await updateDoc(studentRef, {
            utilities: arrayRemove(utilityToRemove)
        });
      } else {
        // Add 'missing' and remove 'present'
        await updateDoc(studentRef, {
            utilities: arrayUnion(utilityToRemove)
        });
         await updateDoc(studentRef, {
            utilities: arrayRemove(utilityToAdd)
        });
      }
    } catch (error) {
        console.error("Error updating utility: ", error);
    }
  };

  const getStatus = (student: any, materialId: string) => {
    if (!student || !student.utilities) return false;
    const utility = student.utilities.find((u: any) => u.materialId === materialId);
    return utility ? utility.status === 'present' : false;
  };
  
  const getPresentCount = (student: any) => {
    if (!student || !student.utilities) return 0;
    return student.utilities.filter((u: any) => u.status === 'present').length || 0;
  }
  
  const requiredMaterialsCount = materials?.length || 0;

  if (loadingStudents || loadingTerm || loadingMaterials) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border-b">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-orange-500" />
            Student Utility Tracking
        </CardTitle>
        <CardDescription className="text-base">
          Monitor and manage the status of materials for each boarding student in the active term.
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
                      <React.Fragment key={student.id}>
                        <Collapsible asChild>
                          <>
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
                                            {materials?.map((material: any) => (
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
                          </>
                        </Collapsible>
                      </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
