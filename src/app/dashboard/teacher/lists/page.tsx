
'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Inbox, Check, AlertCircle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Send className="h-6 w-6 text-primary" />
            Received Lists
        </CardTitle>
        <CardDescription className="text-base mt-1">
          These are lists sent to you by the secretary. Mark them as read once you have reviewed them.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <p className="text-destructive">Error: {error.message}</p>}
        {!isLoading && !error && (
          <AnimatePresence>
            {lists && lists.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {lists.map((list, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                    key={list.id}
                  >
                  <AccordionItem value={list.id} className="border-b-0 mb-3 overflow-hidden rounded-lg border bg-card/50 shadow-sm">
                    <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline hover:bg-accent/50">
                      <div className="flex justify-between items-center w-full">
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
                    <AccordionContent className="bg-accent/20">
                      <div className="p-4 space-y-4">
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
                  </motion.div>
                ))}
              </Accordion>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-muted-foreground py-24 border-2 border-dashed rounded-lg"
              >
                <Inbox className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="text-xl font-semibold">Your inbox is empty.</p>
                <p className="mt-2 text-sm">You have no unread lists from the secretary.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}
