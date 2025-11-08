
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const studentFormSchema = z.object({
  location: z.string().min(2, 'Location is required.'),
  religion: z.enum(['Adventist', 'Abahamya', 'Catholic', 'Ajepra', 'Muslim'], { required_error: 'Please select a religion.'}),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters.'),
  parentPhone: z.string().regex(/^(07)\d{8}$/, 'Invalid phone number format (e.g., 0788123456).'),
});

type FormValues = z.infer<typeof studentFormSchema>;

interface EditStudentFormProps {
  student: DocumentData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function EditStudentForm({ student, isOpen, onOpenChange, onUpdate }: EditStudentFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const form = useForm<FormValues>({
        resolver: zodResolver(studentFormSchema),
    });
    
    useEffect(() => {
        if (isOpen && student) {
            form.reset({
                 location: student.location || '',
                 religion: student.religion,
                 parentName: student.parentName || '',
                 parentPhone: student.parentPhone || ''
            });
        }
    }, [isOpen, student, form]);

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
            setIsLoading(false);
            return;
        }

        if (!student?.id) {
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Student ID is missing.' 
            });
            setIsLoading(false);
            return;
        }
        
        const studentRef = doc(firestore, 'students', student.id);

        updateDoc(studentRef, data)
            .then(() => {
                toast.success({
                    title: "Student Updated",
                    description: `Information for ${student.name} has been updated.`,
                });
                onUpdate();
                onOpenChange(false);
            })
            .catch(serverError => {
                 const permissionError = new FirestorePermissionError({
                    path: studentRef.path,
                    operation: 'update',
                    requestResourceData: data,
                });
                errorEmitter.emit('permission-error', permissionError);
                console.error("Failed to update student:", serverError);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] md:sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Student: {student?.name}</DialogTitle>
                    <DialogDescription>
                        Update the student's personal and parental information.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Home Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Capital City" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="religion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Religion</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a religion" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Adventist">Adventist</SelectItem>
                                                <SelectItem value="Abahamya">Abahamya</SelectItem>
                                                <SelectItem value="Catholic">Catholic</SelectItem>
                                                <SelectItem value="Ajepra">Ajepra</SelectItem>
                                                <SelectItem value="Muslim">Muslim</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="parentName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent/Guardian Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jane Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="parentPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent/Guardian Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0788123456" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                       </div>
                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isLoading}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
