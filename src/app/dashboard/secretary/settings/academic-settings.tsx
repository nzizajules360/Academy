
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, PlusCircle, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const yearSchema = z.object({
    year: z.string().regex(/^\d{4}-\d{4}$/, 'Year must be in YYYY-YYYY format.'),
});

export function AcademicSettings() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isCreatingYear, setIsCreatingYear] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const yearsCollection = firestore ? collection(firestore, 'academicYears') : null;
    const [yearsSnapshot, loadingYears] = useCollection(yearsCollection);

    const appSettingsRef = firestore ? doc(firestore, 'settings', 'app') : null;
    const [appSettings, loadingAppSettings] = useDocumentData(appSettingsRef);
    const activeTermId = appSettings?.activeTermId;
    
    const { register: registerYear, handleSubmit: handleYearSubmit, formState: { errors: yearErrors }, reset: resetYear } = useForm({
        resolver: zodResolver(yearSchema),
    });

    const createAcademicYear = async (data: z.infer<typeof yearSchema>) => {
        setIsCreatingYear(true);
        if (!firestore) return;
        try {
            await addDoc(collection(firestore, 'academicYears'), { year: data.year });
            toast.success({ title: 'Success', description: 'Academic year created.' });
            resetYear();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create academic year.' });
        }
        setIsCreatingYear(false);
    };
    
    const setActiveTerm = async (termId: string) => {
        setIsUpdating(true);
        if (!firestore) return;
        try {
            await setDoc(doc(firestore, 'settings', 'app'), { activeTermId: termId }, { merge: true });
            toast.success({ title: 'Success', description: 'Active term has been updated.' });
        } catch (error) {
             console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not set active term.' });
        }
        setIsUpdating(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Academic Settings</CardTitle>
                <CardDescription>Manage academic years and terms. Set the active term for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Create New Academic Year</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleYearSubmit(createAcademicYear)} className="flex items-start gap-2">
                            <div className="flex-grow">
                                <Input {...registerYear('year')} placeholder="e.g., 2024-2025" />
                                {yearErrors.year && <p className="text-sm text-destructive mt-1">{yearErrors.year.message}</p>}
                            </div>
                            <Button type="submit" disabled={isCreatingYear}>
                                {isCreatingYear && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <PlusCircle className="mr-2" /> Create Year
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Existing Academic Years</h3>
                    {loadingYears && <Loader2 className="animate-spin" />}
                    {!loadingYears && yearsSnapshot?.empty && <p className="text-muted-foreground">No academic years found.</p>}
                    <Accordion type="single" collapsible className="w-full">
                        {yearsSnapshot?.docs.map(yearDoc => (
                            <AcademicYearItem 
                                key={yearDoc.id} 
                                yearDoc={yearDoc}
                                activeTermId={activeTermId}
                                onSetActiveTerm={setActiveTerm}
                                isUpdating={isUpdating}
                            />
                        ))}
                    </Accordion>
                </div>
                 {!activeTermId && !loadingAppSettings && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-4">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <div>
                            <h4 className="font-bold text-destructive">No Active Term Set</h4>
                            <p className="text-sm text-destructive/80">Please create a year and term, then set one as active. The application may not function correctly otherwise.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function AcademicYearItem({ yearDoc, activeTermId, onSetActiveTerm, isUpdating: isGloballyUpdating }: any) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLocallyUpdating, setIsLocallyUpdating] = useState(false);
    const termsCollection = firestore ? collection(firestore, 'academicYears', yearDoc.id, 'terms') : null;
    const [termsSnapshot, loadingTerms] = useCollection(termsCollection);
    const [newTermName, setNewTermName] = useState<'First Term' | 'Second Term' | 'Third Term'>('First Term');

    const isUpdating = isGloballyUpdating || isLocallyUpdating;

    const existingTermNames = termsSnapshot?.docs.map(d => d.data().name) || [];
    const availableTerms = ['First Term', 'Second Term', 'Third Term'].filter(t => !existingTermNames.includes(t));

    const handleCreateTerm = async () => {
        if (availableTerms.length === 0 || !firestore) return;
        setIsLocallyUpdating(true);
        try {
            const termsCollection = collection(firestore, 'academicYears', yearDoc.id, 'terms');
            await addDoc(termsCollection, { name: newTermName, status: 'active', academicYearId: yearDoc.id });
            toast.success({ title: 'Success', description: `Term '${newTermName}' created.` });
            if (availableTerms.length > 1) {
                setNewTermName(availableTerms[1] as any);
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create term.' });
        }
        setIsLocallyUpdating(false);
    };
    
    const handleEndTerm = async (termId: string) => {
        if (!firestore) return;
        setIsLocallyUpdating(true);
        try {
            await updateDoc(doc(firestore, 'academicYears', yearDoc.id, 'terms', termId), { status: 'ended' });
            toast.success({ title: 'Success', description: 'Term has been marked as ended.' });

            if (activeTermId === `${yearDoc.id}_${termId}`) {
                await setDoc(doc(firestore, 'settings', 'app'), { activeTermId: null }, { merge: true });
                toast({ title: 'Active Term Cleared', description: 'The ended term was the active term. Please set a new active term.' });
            }

        } catch (error) {
             console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not end term.' });
        }
        setIsLocallyUpdating(false);
    }
    
    const handleSetDeadline = async (termId: string, deadline: Date) => {
        if (!firestore) return;
        setIsLocallyUpdating(true);
        try {
            await updateDoc(doc(firestore, 'academicYears', yearDoc.id, 'terms', termId), { 
                paymentDeadline: format(deadline, 'yyyy-MM-dd')
            });
            toast.success({ title: 'Success', description: 'Payment deadline has been set.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not set payment deadline.' });
        }
        setIsLocallyUpdating(false);
    }
    
    return (
        <AccordionItem value={yearDoc.id}>
            <AccordionTrigger>
                <span className="text-xl font-bold">{yearDoc.data().year}</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
                {loadingTerms ? <Loader2 className="animate-spin"/> : (
                    <div className="space-y-4 pl-4 border-l-2">
                        {termsSnapshot?.docs.map(termDoc => (
                            <div key={termDoc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-md hover:bg-muted/50 gap-4">
                                <div className="flex items-center gap-2">
                                   <span className="font-medium">{termDoc.data().name}</span>
                                   {termDoc.data().status === 'ended' ? <Badge variant="destructive">Ended</Badge> : <Badge variant="secondary">Active</Badge>}
                                   {activeTermId === `${yearDoc.id}_${termDoc.id}` && (
                                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>App Active</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button size="sm" variant="outline" disabled={isUpdating || termDoc.data().status === 'ended'}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {termDoc.data().paymentDeadline ? format(new Date(termDoc.data().paymentDeadline), 'PPP') : "Set Deadline"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={termDoc.data().paymentDeadline ? new Date(termDoc.data().paymentDeadline) : undefined}
                                                onSelect={(date) => date && handleSetDeadline(termDoc.id, date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Button size="sm" variant="outline" onClick={() => onSetActiveTerm(`${yearDoc.id}_${termDoc.id}`)} disabled={isUpdating || activeTermId === `${yearDoc.id}_${termDoc.id}` || termDoc.data().status === 'ended'}>Set Active</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive" disabled={isUpdating || termDoc.data().status === 'ended'}>End Term</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Ending a term is irreversible. All student data for this term will be archived. You will not be able to add new students to this term.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleEndTerm(termDoc.id)}>Yes, End Term</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {!loadingTerms && termsSnapshot?.docs.length === 3 && <p className="text-sm text-muted-foreground pl-4">All three terms have been created for this year.</p>}
                 {!loadingTerms && termsSnapshot?.docs.length < 3 && (
                     <div className="pl-4 mt-4 space-y-2">
                        <h4 className="font-semibold">Add New Term</h4>
                        <div className="flex items-center gap-2">
                            <Select onValueChange={(val: any) => setNewTermName(val)} defaultValue={availableTerms[0]}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select a term" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTerms.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleCreateTerm} disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Term
                            </Button>
                        </div>
                    </div>
                 )}
            </AccordionContent>
        </AccordionItem>
    );
}

    