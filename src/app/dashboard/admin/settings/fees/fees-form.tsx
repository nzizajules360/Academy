'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, School, TrendingUp, Shield, CheckCircle2, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const feesSettingsSchema = z.object({
  oLevelFee: z.coerce.number().min(1000, 'Fee must be at least RWF 1,000').max(10000000, 'Fee seems too high'),
  aLevelFee: z.coerce.number().min(1000, 'Fee must be at least RWF 1,000').max(10000000, 'Fee seems too high'),
});

type FeesSettingsValues = z.infer<typeof feesSettingsSchema>;

// Currency Formatter
const formatRWF = (amount: number) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Animated Number Display
const AnimatedNumber = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const change = value - startValue;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + change * easeOutQuart;
      
      setDisplayValue(Math.floor(currentValue));

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  return <span>{formatRWF(displayValue)}</span>;
};

export function FeesForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
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

    // Watch for form changes
    const watchedValues = form.watch();
    useEffect(() => {
        if (feeSettings) {
            const hasFormChanged = 
                watchedValues.oLevelFee !== feeSettings.oLevelFee ||
                watchedValues.aLevelFee !== feeSettings.aLevelFee;
            setHasChanges(hasFormChanged);
        }
    }, [watchedValues, feeSettings]);

    useEffect(() => {
        if (feeSettings) {
            form.reset({
                oLevelFee: feeSettings.oLevelFee || 0,
                aLevelFee: feeSettings.aLevelFee || 0,
            });
        }
    }, [feeSettings, form]);

    async function onSubmit(data: FeesSettingsValues) {
        setIsLoading(true);
        if (!firestore) {
            toast({ 
                variant: 'destructive', 
                title: 'Connection Error', 
                description: 'Unable to connect to database. Please try again.' 
            });
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

            setHasChanges(false);
            toast.success({
                title: "✅ Settings Saved Successfully",
                description: "The school fee structure has been updated and will apply to new enrollments.",
            });
        } catch (e) {
            console.error("Failed to save settings:", e);
            if (!(e instanceof FirestorePermissionError)) {
                 toast({
                    variant: 'destructive',
                    title: "🚫 Save Failed",
                    description: "Could not save fee settings. Please check your permissions or network connection.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    }

    if (loadingFees) {
        return (
            <div className="flex items-center justify-center p-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="h-12 w-12 text-primary" />
                    <p className="text-muted-foreground">Loading fee settings...</p>
                </motion.div>
            </div>
        )
    }

    const currentOLevelFee = feeSettings?.oLevelFee || 0;
    const currentALevelFee = feeSettings?.aLevelFee || 0;

    return (
        <TooltipProvider>
            <div className="space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Fee Structure Management
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Configure tuition fees for different education levels. Changes will apply to new student enrollments.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Current Fees Overview */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-b">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Current Fee Structure
                                </CardTitle>
                                <CardDescription>
                                    Active tuition fees for the current academic year
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border">
                                        <div>
                                            <p className="font-semibold text-blue-900">O-Level (S1-S3)</p>
                                            <p className="text-sm text-blue-600">Lower Secondary</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-900">
                                                <AnimatedNumber value={currentOLevelFee} />
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border">
                                        <div>
                                            <p className="font-semibold text-purple-900">A-Level (S4-L5)</p>
                                            <p className="text-sm text-purple-600">Upper Secondary</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-purple-900">
                                                <AnimatedNumber value={currentALevelFee} />
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-medium text-amber-900">Fee Update Policy</p>
                                            <p className="text-sm text-amber-700">
                                                Changes affect new enrollments only. Existing students maintain their original fee structure.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Fees Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                            <DollarSign className="h-6 w-6 text-primary" />
                                            Update Fee Structure
                                        </CardTitle>
                                        <CardDescription className="text-base mt-2">
                                            Set new tuition fees for O-Level and A-Level programs
                                        </CardDescription>
                                    </div>
                                    <AnimatePresence>
                                        {hasChanges && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                            >
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                                                    Unsaved Changes
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField
                                                control={form.control}
                                                name="oLevelFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            O-Level Fee (S1-S3)
                                                        </FormLabel>
                                                        <FormDescription className="text-sm">
                                                            Tuition fee for lower secondary education
                                                        </FormDescription>
                                                        <FormControl>
                                                            <motion.div whileFocus={{ scale: 1.02 }}>
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="e.g., 500000" 
                                                                    className="h-12 text-lg font-medium"
                                                                    {...field} 
                                                                />
                                                            </motion.div>
                                                        </FormControl>
                                                        <FormMessage />
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            Current: {formatRWF(currentOLevelFee)}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="aLevelFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                            A-Level Fee (S4-L5)
                                                        </FormLabel>
                                                        <FormDescription className="text-sm">
                                                            Tuition fee for upper secondary education
                                                        </FormDescription>
                                                        <FormControl>
                                                            <motion.div whileFocus={{ scale: 1.02 }}>
                                                                <Input 
                                                                    type="number" 
                                                                    placeholder="e.g., 600000" 
                                                                    className="h-12 text-lg font-medium"
                                                                    {...field} 
                                                                />
                                                            </motion.div>
                                                        </FormControl>
                                                        <FormMessage />
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            Current: {formatRWF(currentALevelFee)}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="h-4 w-4" />
                                                All amounts are in Rwandan Francs (RWF)
                                            </div>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button 
                                                    type="submit" 
                                                    disabled={isLoading || !hasChanges}
                                                    size="lg"
                                                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {isLoading ? (
                                                            <motion.div
                                                                key="loading"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Saving Changes...
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="save"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Save Fee Structure
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </TooltipProvider>
    );
}
