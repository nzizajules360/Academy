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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { addDoc, collection, doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useRouter } from 'next/navigation';
import { useActiveTerm } from '@/hooks/use-active-term';
import Link from 'next/link';

const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  class: z.string().min(1, 'Please select a class.'),
  gender: z.enum(['male', 'female'], { required_error: 'Please select a gender.'}),
  location: z.string().min(2, 'Location is required.'),
  religion: z.enum(['Adventist', 'Abahamya', 'Catholic', 'Ajepra', 'Muslim'], { required_error: 'Please select a religion.'}),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters.'),
  parentPhone: z.string().regex(/^(07)\d{8}$/, 'Invalid phone number format (e.g., 0788123456).'),
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
    const { activeTermId, loading: loadingTerm } = useActiveTerm();

    const feesDocRef = firestore ? doc(firestore, 'settings', 'fees') : null;
    const [feeSettings, loadingFees] = useDocumentData(feesDocRef);

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentFormSchema),
        defaultValues: {
            name: '',
            class: '',
            gender: 'male',
            parentName: '',
            parentPhone: '',
            location: '',
            religion: 'Catholic',
            totalFees: 0,
            feesPaid: 0,
        },
    });

    const selectedClass = form.watch('class');

    useEffect(() => {
        if (selectedClass && feeSettings) {
            const isOLevel = ['S1', 'S2', 'S3'].includes(selectedClass);
            form.setValue('totalFees', isOLevel ? feeSettings.oLevelFee : feeSettings.aLevelFee);
        }
    }, [selectedClass, form, feeSettings]);
    
    useEffect(() => {
        if (feeSettings) {
             const currentClass = form.getValues('class');
             if (currentClass) {
                const isOLevel = ['S1', 'S2', 'S3'].includes(currentClass);
                form.setValue('totalFees', isOLevel ? feeSettings.oLevelFee : feeSettings.aLevelFee, { shouldValidate: true });
             }
        }
    }, [feeSettings, form])

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

        if (!activeTermId) {
            toast({
                variant: 'destructive',
                title: 'No Active Term',
                description: 'Cannot enroll student because no academic term is active. Please set one in the settings.',
            });
            setIsLoading(false);
            return;
        }
        
        const studentData = { ...data, termId: activeTermId };

        try {
            const studentsCollection = collection(firestore, 'students');
            await addDoc(studentsCollection, studentData)
                .catch((serverError) => {
                    const permissionError = new FirestorePermissionError({
                        path: studentsCollection.path,
                        operation: 'create',
                        requestResourceData: studentData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw serverError;
                });

            toast({
                title: "Student Registered",
                description: `${data.name} has been successfully added to the system for the active term.`,
            });
            form.reset();
            router.push('/dashboard/secretary/students');
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
    
    if (loadingTerm) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!activeTermId) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Enroll New Student</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-8 flex flex-col items-center justify-center text-center gap-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                        <h3 className="text-xl font-bold text-destructive">No Active Term</h3>
                        <p className="text-destructive/80">
                            You cannot enroll a new student because there is no active academic term.
                            Please go to <Link href="/dashboard/secretary/settings/academic" className="underline font-bold">Academic Settings</Link> to create and activate a term.
                        </p>
                    </div>
                </CardContent>
             </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Enroll New Student</CardTitle>
                <CardDescription>Fill out the form below to register a new student in the system. They will be enrolled in the current active term.</CardDescription>
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
                                                    <SelectItem value="S1">S1</SelectItem>
                                                    <SelectItem value="S2">S2</SelectItem>
                                                    <SelectItem value="S3">S3</SelectItem>
                                                    <SelectItem value="S4 ACC">S4 ACC</SelectItem>
                                                    <SelectItem value="S5 ACC">S5 ACC</SelectItem>
                                                    <SelectItem value="S6 ACC">S6 ACC</SelectItem>
                                                    <SelectItem value="L3 SWD">L3 SWD</SelectItem>
                                                    <SelectItem value="L4 SWD">L4 SWD</SelectItem>
                                                    <SelectItem value="L5 SWD">L5 SWD</SelectItem>
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
                                <FormField
                                    control={form.control}
                                    name="religion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Religion</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                                                <Input placeholder="0788123456" {...field} />
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
                                 {loadingFees ? <Loader2 className="mt-2 h-4 w-4 animate-spin" /> : <Input type="text" value={`RWF ${form.getValues('totalFees').toLocaleString()}`} readOnly disabled className="mt-2" /> }
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
                        <Button type="submit" disabled={isLoading || loadingFees}>
                            {(isLoading || loadingFees) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Student
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
