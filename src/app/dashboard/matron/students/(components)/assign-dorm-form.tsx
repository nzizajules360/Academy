
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const dormFormSchema = z.object({
  dormitoryBed: z.coerce.number().min(1, 'Bed number must be 1 or greater.'),
});

type FormValues = z.infer<typeof dormFormSchema>;

interface AssignDormFormProps {
  student: DocumentData;
  allStudents: DocumentData[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function AssignDormForm({ student, allStudents, isOpen, onOpenChange, onUpdate }: AssignDormFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const form = useForm<FormValues>({
        resolver: zodResolver(dormFormSchema),
    });
    
    useEffect(() => {
        if (isOpen && student) {
            form.reset({
                 dormitoryBed: student.dormitoryBed || ''
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

        const studentsInBed = allStudents.filter(s => s.dormitoryBed === data.dormitoryBed && s.id !== student.id);
        if (studentsInBed.length >= 2) {
            form.setError('dormitoryBed', { message: 'This bed is already full (max 2 students).' });
            setIsLoading(false);
            return;
        }
        
        const studentRef = doc(firestore, 'students', student.id);
        const updateData = { dormitoryBed: data.dormitoryBed };

        updateDoc(studentRef, updateData)
            .then(() => {
                toast.success({
                    title: "Bed Assigned",
                    description: `${student.name} has been assigned to bed ${data.dormitoryBed}.`,
                });
                onUpdate();
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: studentRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
                console.error("Failed to assign bed:", serverError);
            })
            .finally(() => {
                setIsLoading(false);
                onOpenChange(false);
            });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Bed for: {student?.name}</DialogTitle>
                    <DialogDescription>
                       Enter the dormitory bed number. Each bed can be assigned to a maximum of two students.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="dormitoryBed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dormitory Bed Number</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isLoading}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Assignment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
