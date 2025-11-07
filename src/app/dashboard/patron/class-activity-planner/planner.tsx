'use client';
import { useState, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, setDoc } from 'firebase/firestore';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Calendar as CalendarIcon, CheckCircle, PlusCircle, Sparkles } from 'lucide-react';
import { useActiveTerm } from '@/hooks/use-active-term';
import { useToast } from '@/hooks/use-toast';
import { generateClassActivityPlan } from '@/ai/flows/generate-class-activity-plan';

interface PlannerProps {
  gender: 'male' | 'female';
}

interface ActivityPlan {
    id: string;
    class: string;
    date: string;
    morningActivity: string;
    eveningActivity: string;
}

export function ClassActivityPlanner({ gender }: PlannerProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { activeTermId, loading: loadingTerm } = useActiveTerm();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [morningActivity, setMorningActivity] = useState('');
  const [eveningActivity, setEveningActivity] = useState('');
  const [aiFocus, setAiFocus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const formattedDate = format(date, 'yyyy-MM-dd');

  // Memoize students query to prevent re-fetching on every render
  const studentsQuery = useMemo(() => {
    if (!firestore || !activeTermId) return null;
    return query(
      collection(firestore, 'students'),
      where('termId', '==', activeTermId)
    );
  }, [firestore, activeTermId]);
  const [studentsSnapshot, loadingStudents] = useCollection(studentsQuery);

  // Memoize activities query
  const activitiesQuery = useMemo(() => {
    if (!firestore || !activeTermId) return null;
    return query(
      collection(firestore, 'dailyActivities'),
      where('termId', '==', activeTermId),
      where('date', '==', formattedDate)
    );
  }, [firestore, activeTermId, formattedDate]);
  const [activitiesSnapshot, loadingActivities] = useCollection(activitiesQuery);

  // Process data once
  const { relevantClasses, activitiesByClass } = useMemo(() => {
    const students = studentsSnapshot?.docs.map(d => d.data()) || [];
    const activities = activitiesSnapshot?.docs.map(d => ({id: d.id, ...d.data()}) as ActivityPlan) || [];

    const relevantClasses = [...new Set(
      students
        .filter(s => s.gender === gender)
        .map(s => s.class)
    )].sort();
    
    const activitiesByClass = activities.reduce((acc, activity) => {
      acc[activity.class] = activity;
      return acc;
    }, {} as Record<string, ActivityPlan>);

    return { relevantClasses, activitiesByClass };
  }, [studentsSnapshot, activitiesSnapshot, gender]);

  const handleOpenDialog = (className: string) => {
    const existingPlan = activitiesByClass[className];
    setMorningActivity(existingPlan?.morningActivity || '');
    setEveningActivity(existingPlan?.eveningActivity || '');
    setSelectedClass(className);
    setIsDialogOpen(true);
  };
  
  const handleGeneratePlan = async () => {
    if (!selectedClass) return;
    setIsGenerating(true);
    try {
        const result = await generateClassActivityPlan({
            class: selectedClass,
            gender,
            focus: aiFocus,
        });
        setMorningActivity(result.morningActivity);
        setEveningActivity(result.eveningActivity);
        toast({ title: 'Plan Generated!', description: 'The AI has created a plan for you. Review and save.' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate an activity plan.' });
    } finally {
        setIsGenerating(false);
    }
  }

  const handleSavePlan = async () => {
    if (!selectedClass || !user || !activeTermId || !firestore) return;
    setIsSaving(true);
    const activityId = `${formattedDate}_${selectedClass}`;
    const activityRef = doc(firestore, 'dailyActivities', activityId);
    
    const planData = {
        class: selectedClass,
        date: formattedDate,
        termId: activeTermId,
        morningActivity,
        eveningActivity,
        createdBy: user.uid,
    };

    try {
        await setDoc(activityRef, planData, { merge: true });
        toast({ title: 'Plan Saved!', description: `Activity plan for ${selectedClass} on ${formattedDate} has been saved.` });
        setIsDialogOpen(false);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the activity plan.' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const isLoading = loadingTerm || loadingStudents || loadingActivities;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Activity Planner</CardTitle>
        <CardDescription>
          Create and manage daily activities for the {gender} students' classes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Select Date:</h3>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className="w-[280px] justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
        </div>
        
        {isLoading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}

        {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relevantClasses.map(className => (
                    <Card key={className} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{className}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
                            {activitiesByClass[className] ? (
                                <div className="space-y-2">
                                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                                    <p className="font-semibold text-green-600">Plan exists for this date.</p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No plan for this date.</p>
                            )}
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button className="w-full" onClick={() => handleOpenDialog(className)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {activitiesByClass[className] ? 'View / Edit Plan' : 'Create Plan'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        )}

         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Activity Plan for {selectedClass}</DialogTitle>
                    <DialogDescription>
                        Date: {format(date, "PPP")}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="morning-activity">Morning Activity</Label>
                        <Textarea id="morning-activity" value={morningActivity} onChange={e => setMorningActivity(e.target.value)} rows={5} placeholder="e.g., General cleaning of the dormitory and surroundings..."/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="evening-activity">Evening Activity</Label>
                        <Textarea id="evening-activity" value={eveningActivity} onChange={e => setEveningActivity(e.target.value)} rows={5} placeholder="e.g., Supervised personal study time..."/>
                    </div>

                    <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center gap-2">
                           <Sparkles className="h-5 w-5 text-primary" />
                           <h4 className="font-semibold">AI Assistant</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Optionally provide a focus for the day, and let the AI generate a plan for you.
                        </p>
                        <div className="flex gap-2">
                           <Input value={aiFocus} onChange={e => setAiFocus(e.target.value)} placeholder="e.g., Prepare for upcoming exams"/>
                            <Button onClick={handleGeneratePlan} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isSaving}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSavePlan} disabled={isSaving || isGenerating}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Plan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}
