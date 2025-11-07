import { materials } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function MaterialsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Material List</CardTitle>
        <CardDescription>
          This is the official list of materials all boarding students are required to have.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Name</TableHead>
              <TableHead className="text-right">Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell className="text-right">
                  {material.required ? (
                     <Badge>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Yes
                     </Badge>
                  ) : (
                    <Badge variant="secondary">
                       <XCircle className="mr-2 h-4 w-4" />
                       No
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
