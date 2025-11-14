'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bed, Users, X, Save, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
    const [bedOccupants, setBedOccupants] = useState<DocumentData[]>([]);
    const firestore = useFirestore();

    const form = useForm<FormValues>({
        resolver: zodResolver(dormFormSchema),
        defaultValues: {
            dormitoryBed: undefined
        }
    });
    
    const watchedBed = form.watch('dormitoryBed');

    useEffect(() => {
        if (isOpen && student) {
            form.reset({
                 dormitoryBed: student.dormitoryBed ?? undefined
            });
        }
    }, [isOpen, student, form]);

    // Update bed occupants when bed number changes
    useEffect(() => {
        if (watchedBed) {
            const occupants = allStudents.filter(
                s => s.dormitoryBed === watchedBed && s.id !== student.id
            );
            setBedOccupants(occupants);
        } else {
            setBedOccupants([]);
        }
    }, [watchedBed, allStudents, student.id]);

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        const db = firestore;
        
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

        const studentsInBed = allStudents.filter(
            s => s.dormitoryBed === data.dormitoryBed && s.id !== student.id
        );
        
        if (studentsInBed.length >= 2) {
            form.setError('dormitoryBed', { 
                message: 'This bed is already full (max 2 students).' 
            });
            setIsLoading(false);
            return;
        }
        
        try {
            const studentRef = doc(db, 'students', student.id);
            const updateData = { dormitoryBed: data.dormitoryBed };
            await updateDoc(studentRef, updateData);
            
            toast({
                title: "✓ Bed Assigned",
                description: `${student.name} has been assigned to bed ${data.dormitoryBed}.`,
                className: "bg-green-50 border-green-200",
            });
            
            onUpdate();
            onOpenChange(false);
            form.reset();
        } catch (serverError) {
            const studentRef = doc(db, 'students', student.id);
            const updateData = { dormitoryBed: data.dormitoryBed };
            const permissionError = new FirestorePermissionError({
                path: studentRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            
            console.error("Failed to assign bed:", serverError);
            
            toast({
                variant: 'destructive',
                title: '✗ Assignment Failed',
                description: 'Could not assign bed. Please check your permissions and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancel = () => {
        form.reset();
        onOpenChange(false);
    };

    const availableSpaces = watchedBed ? 2 - bedOccupants.length : 2;
    const isBedFull = watchedBed && availableSpaces <= 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-2 shadow-2xl">
                <AnimatePresence mode="wait">
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Header with gradient */}
                            <DialogHeader className="px-6 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white space-y-2">
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                        <Bed className="h-6 w-6" />
                                        Assign Dormitory Bed
                                    </DialogTitle>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="h-8 w-8 rounded-full hover:bg-white/20 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <DialogDescription className="text-purple-100">
                                    Assign a bed for <span className="font-semibold text-white">{student?.name}</span>
                                </DialogDescription>
                            </DialogHeader>

                            {/* Form Content */}
                            <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="dormitoryBed"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Bed className="h-4 w-4 text-purple-600" />
                                                        Dormitory Bed Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            placeholder="e.g., 101" 
                                                            {...field}
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === '' ? undefined : value);
                                                            }}
                                                            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-11 text-lg font-semibold"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-gray-500 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        Each bed can accommodate a maximum of 2 students
                                                    </FormDescription>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Bed Occupancy Info */}
                                        <AnimatePresence mode="wait">
                                            {watchedBed && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                                                                <Users className="h-4 w-4" />
                                                                Bed {watchedBed} Occupancy
                                                            </h4>
                                                            <Badge 
                                                                variant={availableSpaces > 0 ? "default" : "destructive"}
                                                                className={availableSpaces > 0 ? "bg-green-500 hover:bg-green-600" : ""}
                                                            >
                                                                {availableSpaces} space{availableSpaces !== 1 ? 's' : ''} available
                                                            </Badge>
                                                        </div>
                                                        
                                                        {bedOccupants.length > 0 ? (
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-purple-700 font-medium">Current occupants:</p>
                                                                <ul className="space-y-1">
                                                                    {bedOccupants.map((occupant) => (
                                                                        <li 
                                                                            key={occupant.id} 
                                                                            className="text-sm text-purple-800 bg-white px-3 py-2 rounded border border-purple-200"
                                                                        >
                                                                            • {occupant.name}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-purple-600 italic">
                                                                This bed is currently empty
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Action Buttons */}
                                        <DialogFooter className="pt-6 gap-3 sm:gap-2 flex-col sm:flex-row">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={handleCancel}
                                                disabled={isLoading}
                                                className="w-full sm:w-auto border-2 hover:bg-gray-50"
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={isLoading || isBedFull}
                                                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Assigning...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Save Assignment
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}