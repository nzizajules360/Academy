'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useRouter } from 'next/navigation';

const A_LEVEL_FEE = 2000;
const O_LEVEL_FEE = 1800;

const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  class: z.string().min(1, 'Please select a class.'),
  gender: z.enum(['male', 'female'], { required_error: 'Please select a gender.'}),
  location: z.string().min(2, 'Location is required.'),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters.'),
  parentPhone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Invalid phone number format (e.g., 123-456-7890).'),
  totalFees: z.coerce.number().min(0, 'Total fees must be a positive number.'),
  feesPaid: z.coerce.number().min(0, 'Fees paid must be a positive number.'),
}).refine(data => data.feesPaid <= data.totalFees, {
    message: "Fees paid cannot exceed total fees.",
    path: ["feesPaid"],
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export function StudentForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const router = useRouter();

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentFormSchema),
        defaultValues: {
            name: '',
            class: '',
            gender: 'male',
            parentName: '',
            parentPhone: '',
            location: '',
            totalFees: A_LEVEL_FEE,
            feesPaid: 0,
        },
    });

    const selectedClass = form.watch('class');

    useEffect(() => {
        if (selectedClass) {
            const isOLevel = selectedClass.startsWith('Grade 9') || selectedClass.startsWith('Grade 10');
            form.setValue('totalFees', isOLevel ? O_LEVEL_FEE : A_LEVEL_FEE);
        }
    }, [selectedClass, form]);

    async function onSubmit(data: StudentFormValues) {
        setIsLoading(true);
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Firestore is not initialized. Cannot save student.',
            });
            setIsLoading(false);
            return;
        }

        try {
            const studentsCollection = collection(firestore, 'students');
            await addDoc(studentsCollection, data)
                .catch((serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: studentsCollection.path,
                        operation: 'create',
                        requestResourceData: data,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw serverError;
                });

            toast({
                title: "Student Registered",
                description: `${data.name} has been successfully added to the system.`,
            });
            form.reset();
            router.push('/dashboard/students');
        } catch(e) {
            console.error("Failed to add student:", e);
             toast({
                variant: 'destructive',
                title: "Registration Failed",
                description: "Could not save student to the database. See console for details.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Enroll New Student</CardTitle>
                <CardDescription>Fill out the form below to register a new student in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Student Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="class"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Class</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a class" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Grade 9A">Grade 9A</SelectItem>
                                                    <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                                                    <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                                                    <SelectItem value="Grade 12A">Grade 12A</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Home Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Capital City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4">
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
                                                <Input placeholder="123-456-7890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
                            <div>
                                <FormLabel>Total School Fees</FormLabel>
                                <Input type="text" value={`$${form.getValues('totalFees').toLocaleString()}`} readOnly disabled className="mt-2" />
                            </div>
                             <FormField
                                control={form.control}
                                name="feesPaid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount Paid</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Student
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
