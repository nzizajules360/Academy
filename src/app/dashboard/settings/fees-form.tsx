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
import { useState } from 'react';

const A_LEVEL_FEE = 2000;
const O_LEVEL_FEE = 1800;

const feesSettingsSchema = z.object({
  oLevelFee: z.coerce.number().min(0, 'Fee must be a positive number.'),
  aLevelFee: z.coerce.number().min(0, 'Fee must be a positive number.'),
});

type FeesSettingsValues = z.infer<typeof feesSettingsSchema>;

export function FeesForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FeesSettingsValues>({
        resolver: zodResolver(feesSettingsSchema),
        defaultValues: {
            oLevelFee: O_LEVEL_FEE,
            aLevelFee: A_LEVEL_FEE,
        },
    });

    async function onSubmit(data: FeesSettingsValues) {
        setIsLoading(true);
        
        // In a real application, you would save these values to Firestore.
        // For now, we'll just simulate a save.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Updated Fee Settings:', data);

        toast({
            title: "Settings Saved",
            description: "The school fee structure has been updated.",
        });

        setIsLoading(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>School Fee Settings</CardTitle>
                <CardDescription>Define the standard tuition fees for O-Level and A-Level students.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="oLevelFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>O-Level Fee (Grades 9 & 10)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 1800" {...field} />
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
                                        <FormLabel>A-Level Fee (Grades 11 & 12)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 2000" {...field} />
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
