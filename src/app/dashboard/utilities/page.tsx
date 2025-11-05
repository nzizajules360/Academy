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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { students, materials } from '@/lib/data';
import type { UserRole } from '@/types';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronDown } from 'lucide-react';

type UtilitiesPageProps = {
  searchParams: {
    role?: UserRole;
  };
};

export default function UtilitiesPage({ searchParams }: UtilitiesPageProps) {
  const role = searchParams.role ?? 'admin';
  const genderToDisplay = role === 'patron' ? 'male' : 'female';
  
  const relevantStudents = students.filter(student => 
    student.type === 'boarding' && (role === 'admin' || student.gender === genderToDisplay)
  );

  const getStatus = (studentId: string, materialId: string) => {
    const student = students.find(s => s.id === studentId);
    const utility = student?.utilities.find(u => u.materialId === materialId);
    return utility ? utility.status === 'present' : false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Utility Tracking</CardTitle>
        <CardDescription>
          Monitor and manage the status of materials for each boarding student.
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
                    {relevantStudents.map(student => (
                    <Collapsible asChild key={student.id}>
                        <>
                            <TableRow>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell className="text-right">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <span className="mr-2">
                                                {student.utilities.filter(u => u.status === 'present').length}/{materials.filter(m => m.required).length} Present
                                            </span>
                                            <ChevronDown className="h-4 w-4" />
                                            <span className="sr-only">Toggle</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                </TableCell>
                            </TableRow>
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
                                                    checked={getStatus(student.id, material.id)}
                                                    // disabled because this is a view-only representation
                                                    disabled 
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
