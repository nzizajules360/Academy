'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Phone, User, Heart, X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { motion, AnimatePresence } from 'framer-motion';

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
        defaultValues: {
            location: '',
            religion: undefined,
            parentName: '',
            parentPhone: ''
        }
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
        const db = firestore; // Capture firestore in a constant
        
        if (!db) {
            toast({ 
                variant: 'destructive', 
                title: 'Error', 
                description: 'Firestore not available.' 
            });
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

        try {
            const studentRef = doc(db, 'students', student.id);
            await updateDoc(studentRef, data);
            
            toast({
                title: "✓ Student Updated",
                description: `Information for ${student.name} has been updated successfully.`,
                className: "bg-green-50 border-green-200",
            });
            
            onUpdate();
            onOpenChange(false);
            form.reset();
        } catch (serverError) {
            const studentRef = doc(db, 'students', student.id);
            const permissionError = new FirestorePermissionError({
                path: studentRef.path,
                operation: 'update',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
            
            console.error("Failed to update student:", serverError);
            
            toast({
                variant: 'destructive',
                title: '✗ Update Failed',
                description: 'Could not update student information. Please check your permissions and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancel = () => {
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {isOpen && (
                    <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden border-2 shadow-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Header with gradient */}
                            <DialogHeader className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-2">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                        <User className="h-6 w-6" />
                                        Edit Student
                                    </DialogTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <DialogDescription className="text-blue-100">
                                    Update information for <span className="font-semibold text-white">{student?.name}</span>
                                </DialogDescription>
                            </DialogHeader>

                            {/* Form Content */}
                            <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Location Field */}
                                            <FormField
                                                control={form.control}
                                                name="location"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-blue-600" />
                                                            Home Location
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="e.g., Kigali, Nyarugenge" 
                                                                {...field}
                                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Religion Field */}
                                            <FormField
                                                control={form.control}
                                                name="religion"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <Heart className="h-4 w-4 text-blue-600" />
                                                            Religion
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11">
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
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Parent Name Field */}
                                            <FormField
                                                control={form.control}
                                                name="parentName"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <User className="h-4 w-4 text-blue-600" />
                                                            Parent/Guardian Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="John Doe" 
                                                                {...field}
                                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Parent Phone Field */}
                                            <FormField
                                                control={form.control}
                                                name="parentPhone"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-2">
                                                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-blue-600" />
                                                            Parent/Guardian Phone
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="0788123456" 
                                                                {...field}
                                                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11 font-mono"
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <DialogFooter className="pt-6 gap-3 sm:gap-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={handleCancel}
                                                disabled={isLoading}
                                                className="flex-1 sm:flex-none border-2 hover:bg-gray-50"
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={isLoading}
                                                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </div>
                        </motion.div>
                    </DialogContent>
                )}
            </AnimatePresence>
        </Dialog>
    );
}