
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BedDouble } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

const dormSettingsSchema = z.object({
  studentsPerBed: z.coerce.number().min(1, 'Must be at least 1').max(4, 'Cannot exceed 4'),
});

type DormSettingsValues = z.infer<typeof dormSettingsSchema>;

export function DormitorySettings() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const dormSettingsRef = firestore ? doc(firestore, 'settings', 'dormitory') : null;
    const [dormSettings, loading, error] = useDocumentData(dormSettingsRef);

    const form = useForm<DormSettingsValues>({
        resolver: zodResolver(dormSettingsSchema),
        values: {
            studentsPerBed: dormSettings?.studentsPerBed || 2,
        }
    });

    async function onSubmit(data: DormSettingsValues) {
        if (!dormSettingsRef) return;
        try {
            await setDoc(dormSettingsRef, data, { merge: true });
            toast({
                title: "✅ Success",
                description: "Dormitory settings have been updated.",
                variant: 'success'
            });
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: "🚫 Error",
                description: e.message || "Could not save dormitory settings.",
            });
        }
    }
    
    if (loading) return <Loader2 className="animate-spin" />;
    if (error) return <p className="text-destructive">Error: {error.message}</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dormitory Configuration</CardTitle>
                <CardDescription>Set the maximum number of students that can be assigned to a single dormitory bed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="studentsPerBed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><BedDouble/> Students Per Bed</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className="max-w-xs"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
