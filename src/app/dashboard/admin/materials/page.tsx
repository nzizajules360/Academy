
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

export default function MaterialsPage() {
  const firestore = useFirestore();
  const materialsQuery = firestore ? collection(firestore, 'materials') : null;
  const [materials, loading, error] = useCollectionData(materialsQuery, { idField: 'id' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
        <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Required Materials
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              This is the official list of materials all boarding students are required to have upon arrival.
            </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Student Material List
                </CardTitle>
                <CardDescription className="text-base">
                    Review the items that are mandatory for all students under the school's policy.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>}
                {error && <div className="text-destructive p-8">Error: {error.message}</div>}
                {!loading && materials && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="p-6 font-semibold text-base">Material Name</TableHead>
                            <TableHead className="p-6 text-right font-semibold text-base">Requirement Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.map((material: any, index: number) => (
                            <motion.tr
                                key={material.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-t"
                            >
                                <TableCell className="p-6 font-medium text-base">{material.name}</TableCell>
                                <TableCell className="p-6 text-right">
                                {material.required ? (
                                    <Badge className="text-sm bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Required
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-sm">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Optional
                                    </Badge>
                                )}
                                </TableCell>
                            </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    </motion.div>
  );
}
