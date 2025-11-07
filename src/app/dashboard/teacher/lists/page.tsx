'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Inbox, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function SentListsPage() {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();

  const listsQuery = (firestore && user)
    ? query(
        collection(firestore, 'sentLists'),
        where('sentToTeacherId', '==', user.uid),
        where('isRead', '==', false),
        orderBy('sentAt', 'desc')
      )
    : null;

  const [lists, loadingLists, error] = useCollectionData(listsQuery, { idField: 'id' });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkAsRead = async (listId: string) => {
    if (!firestore) return;
    setIsUpdating(true);
    try {
      const listRef = doc(firestore, 'sentLists', listId);
      await updateDoc(listRef, { isRead: true });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = loadingUser || loadingLists;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent Lists</CardTitle>
        <CardDescription>
          These are lists sent to you by the secretary. Mark them as read once you have reviewed them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <p className="text-destructive">Error: {error.message}</p>}
        {!isLoading && !error && (
          lists && lists.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {lists.map(list => (
                <AccordionItem value={list.id} key={list.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold">{list.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Sent by {list.sentBy} • {formatDistanceToNow(list.sentAt.toDate(), { addSuffix: true })}
                        </span>
                      </div>
                      <Badge variant={list.listType === 'outstanding_fees' ? 'destructive' : 'secondary'}>
                        {list.listType === 'outstanding_fees' ? 'Outstanding Fees' : 'Class Roster'}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class</TableHead>
                            {list.listType === 'outstanding_fees' && <TableHead className="text-right">Amount Due</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.students.map((student: any) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.class}</TableCell>
                              {list.listType === 'outstanding_fees' && (
                                <TableCell className="text-right font-mono text-red-600">
                                  RWF {student.outstandingBalance?.toLocaleString()}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsRead(list.id)}
                          disabled={isUpdating}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Read
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <Inbox className="mx-auto h-12 w-12" />
              <p className="mt-4 font-semibold">Your inbox is empty.</p>
              <p className="mt-1 text-sm">You have no unread lists from the secretary.</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
