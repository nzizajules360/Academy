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
import { useState } from 'react';

const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  class: z.string().min(1, 'Please select a class.'),
  type: z.enum(['boarding', 'external']),
  gender: z.enum(['male', 'female']),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters.'),
  parentPhone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Invalid phone number format (e.g., 123-456-7890).'),
  location: z.string().min(2, 'Location is required.'),
  feesPaid: z.coerce.number().min(0, 'Fees paid cannot be negative.'),
  refectoryTable: z.coerce.number().int().positive('Table number must be a positive integer.'),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export function StudentForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentFormSchema),
        defaultValues: {
            name: '',
            class: '',
            type: 'boarding',
            gender: 'male',
            parentName: '',
            parentPhone: '',
            location: '',
            feesPaid: 0,
            refectoryTable: undefined
        },
    });

    function onSubmit(data: StudentFormValues) {
        setIsLoading(true);
        console.log(data);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Student Registered",
                description: `${data.name} has been successfully added to the system.`,
            });
            form.reset();
        }, 1500);
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <div className="grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Student Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="boarding">Boarding</SelectItem><SelectItem value="external">External</SelectItem></SelectContent>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                                <div className="grid grid-cols-2 gap-4">
                                   <FormField
                                        control={form.control}
                                        name="feesPaid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>School Fees Paid ($)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="1500" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="refectoryTable"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Refectory Table No.</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="12" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
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
