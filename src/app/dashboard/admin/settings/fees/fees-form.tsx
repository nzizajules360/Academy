
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const feesSettingsSchema = z.object({
  oLevelFee: z.coerce.number().min(0, 'Fee must be a positive number.'),
  aLevelFee: z.coerce.number().min(0, 'Fee must be a positive number.'),
});

type FeesSettingsValues = z.infer<typeof feesSettingsSchema>;

export function FeesForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();

    const feesDocRef = firestore ? doc(firestore, 'settings', 'fees') : null;
    const [feeSettings, loadingFees] = useDocumentData(feesDocRef);

    const form = useForm<FeesSettingsValues>({
        resolver: zodResolver(feesSettingsSchema),
        defaultValues: {
            oLevelFee: 0,
            aLevelFee: 0,
        },
    });

    useEffect(() => {
        if (feeSettings) {
            form.reset({
                oLevelFee: feeSettings.oLevelFee,
                aLevelFee: feeSettings.aLevelFee,
            });
        }
    }, [feeSettings, form]);

    async function onSubmit(data: FeesSettingsValues) {
        setIsLoading(true);
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
            setIsLoading(false);
            return;
        }

        try {
            await setDoc(doc(firestore, 'settings', 'fees'), data, { merge: true })
                .catch((serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: 'settings/fees',
                        operation: 'update',
                        requestResourceData: data,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw serverError;
                });

            toast.success({
                title: "Settings Saved",
                description: "The school fee structure has been updated.",
            });
        } catch (e) {
            console.error("Failed to save settings:", e);
            if (!(e instanceof FirestorePermissionError)) {
                 toast({
                    variant: 'destructive',
                    title: "Save Failed",
                    description: "Could not save fee settings. Check permissions or network.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    }

    if (loadingFees) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>School Fee Settings</CardTitle>
                <CardDescription>Define the standard tuition fees for O-Level and A-Level students in RWF.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="oLevelFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>O-Level Fee (S1-S3)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 500000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="aLevelFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>A-Level Fee (S4-L5)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 600000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
