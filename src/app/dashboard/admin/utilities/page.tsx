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
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { materials } from '@/lib/data';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveTerm } from '@/hooks/use-active-term';

export default function UtilitiesPage() {
  const firestore = useFirestore();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();

  const studentsQuery = firestore && activeTermId ? query(collection(firestore, 'students'), where('termId', '==', activeTermId)) : null;
  const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

  const relevantStudents = studentsSnapshot?.docs.map(doc => ({id: doc.id, ...doc.data()}))
    .filter((student: any) => student.gender === 'male' || student.gender === 'female'); // Assuming all students are relevant for admin

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

  if (loadingStudents || loadingTerm) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Utility Tracking</CardTitle>
        <CardDescription>
          Monitor and manage the status of materials for each boarding student in the active term.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {relevantStudents?.map(student => (
                    <Collapsible asChild key={student.id} tag="tbody">
                       <>
                            <tr className="border-b">
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell className="text-right">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <span className="mr-2">
                                                {getPresentCount(student)}/{requiredMaterialsCount} Present
                                            </span>
                                            <ChevronDown className="h-4 w-4" />
                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </TableCell>
                            </tr>
                            <CollapsibleContent asChild>
                                <tr className="bg-muted/50 hover:bg-muted/50">
                                    <td colSpan={3} className="p-0">
                                        <div className="p-4">
                                            <h4 className="font-semibold mb-2">Required Materials for {student.name}</h4>
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                                            {materials.filter(m => m.required).map(material => (
                                                <div key={material.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${student.id}-${material.id}`}
                                                        checked={getStatus(student, material.id)}
                                                        onCheckedChange={(checked) => handleUtilityChange(student.id, material.id, !!checked)}
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
                                    </td>
                                </tr>
                            </CollapsibleContent>
                        </>
                    </Collapsible>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
