
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, addDoc, Timestamp, DocumentData } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActiveTerm } from '@/hooks/use-active-term';

const sendListSchema = z.object({
  teacherId: z.string().min(1, { message: 'Please select a teacher.' }),
  listType: z.enum(['outstanding_fees', 'class_roster'], { required_error: 'Please select a list type.' }),
  class: z.string().optional(),
}).refine(data => data.listType !== 'class_roster' || (data.listType === 'class_roster' && !!data.class), {
  message: 'Please select a class for the roster.',
  path: ['class'],
});

type FormValues = z.infer<typeof sendListSchema>;

interface SendListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  students: DocumentData[];
}

export function SendListDialog({ isOpen, onOpenChange, students }: SendListDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const { activeTermId } = useActiveTerm();
  const [isSending, setIsSending] = useState(false);

  // Fetch teachers
  const teachersQuery = firestore ? query(collection(firestore, 'users'), where('role', '==', 'teacher')) : null;
  const [teachers, loadingTeachers] = useCollectionData(teachersQuery, { idField: 'id' });

  const form = useForm<FormValues>({
    resolver: zodResolver(sendListSchema),
    defaultValues: {
      teacherId: '',
      listType: 'outstanding_fees',
      class: '',
    },
  });

  const listType = form.watch('listType');

  const availableClasses = [...new Set(students.map(s => s.class))].sort();

  async function onSubmit(data: FormValues) {
    if (!firestore || !user || !activeTermId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send list. System not ready.' });
      return;
    }
    setIsSending(true);

    let studentList: any[] = [];
    let listTitle = '';

    if (data.listType === 'outstanding_fees') {
      studentList = students
        .filter(s => s.feesPaid < s.totalFees)
        .map(s => ({
          id: s.id,
          name: s.name,
          class: s.class,
          outstandingBalance: s.totalFees - s.feesPaid,
        }));
      listTitle = 'Students with Outstanding Fees';
    } else if (data.listType === 'class_roster' && data.class) {
      studentList = students
        .filter(s => s.class === data.class)
        .map(s => ({
          id: s.id,
          name: s.name,
          class: s.class,
        }));
      listTitle = `Class Roster for ${data.class}`;
    }

    if (studentList.length === 0) {
      toast({ variant: 'destructive', title: 'Empty List', description: 'There are no students to include in this list.' });
      setIsSending(false);
      return;
    }

    try {
      await addDoc(collection(firestore, 'sentLists'), {
        sentToTeacherId: data.teacherId,
        sentBy: user.displayName,
        sentAt: Timestamp.now(),
        listType: data.listType,
        title: listTitle,
        termId: activeTermId,
        students: studentList,
        isRead: false,
      });
      toast({ title: 'Success!', description: 'The list has been sent to the teacher.' });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send the list.' });
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset({ listType: 'outstanding_fees', class: '', teacherId: '' });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Student List to Teacher</DialogTitle>
          <DialogDescription>
            Select a teacher and the type of list you want to send.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={loadingTeachers}>
                        <SelectValue placeholder={loadingTeachers ? 'Loading teachers...' : 'Select a teacher'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers?.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="listType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a list type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="outstanding_fees">Students with Outstanding Fees</SelectItem>
                      <SelectItem value="class_roster">Class Roster</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {listType === 'class_roster' && (
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class for the roster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableClasses.map(c => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSending}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSending || loadingTeachers}>
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send List
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
