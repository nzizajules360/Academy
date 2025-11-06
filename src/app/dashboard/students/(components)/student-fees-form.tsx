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
import { doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const feesFormSchema = z.object({
  feesPaid: z.coerce.number().min(0, 'Fees paid must be a positive number.'),
});

type FeesFormValues = z.infer<typeof feesFormSchema>;

interface StudentFeesFormProps {
  studentId: string;
  studentName: string;
  totalFees: number;
  currentFeesPaid: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function StudentFeesForm({ studentId, studentName, totalFees, currentFeesPaid, isOpen, onOpenChange, onUpdate }: StudentFeesFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const form = useForm<FeesFormValues>({
        resolver: zodResolver(feesFormSchema),
        defaultValues: {
            feesPaid: currentFeesPaid,
        },
    });
    
    useEffect(() => {
        if (isOpen) {
            form.reset({ feesPaid: currentFeesPaid });
        }
    }, [isOpen, currentFeesPaid, form]);

    async function onSubmit(data: FeesFormValues) {
        setIsLoading(true);
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
            setIsLoading(false);
            return;
        }

        if (data.feesPaid > totalFees) {
            form.setError('feesPaid', { message: 'Paid amount cannot exceed total fees.' });
            setIsLoading(false);
            return;
        }
        
        const studentRef = doc(firestore, 'students', studentId);
        const updateData = { feesPaid: data.feesPaid };

        try {
            await updateDoc(studentRef, updateData)
                .catch((serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: studentRef.path,
                        operation: 'update',
                        requestResourceData: updateData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw serverError; // Rethrow to be caught by the outer catch block
                });

            toast({
                title: "Fees Updated",
                description: `Payment status for ${studentName} has been updated.`,
            });
            onUpdate(); // Trigger refresh on parent
        } catch (e) {
            console.error("Failed to update fees:", e);
            // The permission error toast is handled globally, but we might want a generic one here.
            // Avoid showing two toasts. The global one is more specific.
            if (!(e instanceof FirestorePermissionError)) {
                 toast({
                    variant: 'destructive',
                    title: "Update Failed",
                    description: "Could not update student fees. Check permissions or network.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Fees for {studentName}</DialogTitle>
                    <DialogDescription>
                        Total fees: ${totalFees.toLocaleString()}. Current paid: ${currentFeesPaid.toLocaleString()}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="feesPaid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Amount Paid</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter amount" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" disabled={isLoading}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Fees
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
