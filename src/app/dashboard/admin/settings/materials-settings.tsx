
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Wrench } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const materialSchema = z.object({
  name: z.string().min(2, 'Material name is too short.'),
  required: z.boolean(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

export function MaterialsSettings() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const materialsRef = firestore ? collection(firestore, 'materials') : null;
    const [materials, loading, error] = useCollectionData(materialsRef, { idField: 'id' });

    const form = useForm<MaterialFormValues>({
        resolver: zodResolver(materialSchema),
        defaultValues: { name: '', required: true },
    });

    async function onSubmit(data: MaterialFormValues) {
        if (!materialsRef) return;
        try {
            await addDoc(materialsRef, data);
            toast({
                title: "✅ Success",
                description: "Material has been added.",
                variant: 'success'
            });
            form.reset();
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: "🚫 Error",
                description: e.message || "Could not add material.",
            });
        }
    }
    
    const handleDelete = async (id: string) => {
        if (!firestore) return;
        const materialDoc = doc(firestore, 'materials', id);
        try {
            await deleteDoc(materialDoc);
             toast({
                title: "✅ Success",
                description: "Material has been deleted.",
            });
        } catch (e: any) {
             toast({
                variant: 'destructive',
                title: "🚫 Error",
                description: e.message || "Could not delete material.",
            });
        }
    }

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Material</CardTitle>
                    <CardDescription>Add a new item to the list of school materials.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Material Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Calculator" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="required"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Required</FormLabel>
                                            <FormMessage />
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4"/>}
                                Add Material
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Existing Materials</CardTitle>
                    <CardDescription>The current list of materials for students.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && <Loader2 className="animate-spin" />}
                    {error && <p className="text-destructive">Error: {error.message}</p>}
                    {materials && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {materials.map((m: any) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-medium">{m.name}</TableCell>
                                        <TableCell>{m.required ? 'Yes' : 'No'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
