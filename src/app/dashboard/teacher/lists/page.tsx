
'use client';

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, orderBy, Firestore } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Inbox, MailOpen, Mail, AlertCircle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export default function SentListsPage() {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  const [updatingLists, setUpdatingLists] = useState<Record<string, boolean>>({});

  const listsQuery = (firestore && user)
    ? query(
        collection(firestore, 'sentLists'),
        where('sentToTeacherId', '==', user.uid),
        orderBy('sentAt', 'desc')
      )
    : null;

  const [lists, loadingLists, error] = useCollectionData(listsQuery, { idField: 'id' });

  const unreadLists = lists?.filter(list => !list.isRead) || [];
  const readLists = lists?.filter(list => list.isRead) || [];

  const isLoading = loadingUser || loadingLists;

  const handleMarkAsRead = async (listId: string) => {
    if (!firestore || updatingLists[listId]) return;
    
    setUpdatingLists(prev => ({...prev, [listId]: true }));
    try {
      const listRef = doc(firestore, 'sentLists', listId);
      await updateDoc(listRef, { isRead: true });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setUpdatingLists(prev => ({...prev, [listId]: false }));
    }
  };

  const renderList = (list: any) => {
    return (
      <AccordionItem value={list.id} className="border-b-0 mb-3 overflow-hidden rounded-lg border bg-card/50 shadow-sm">
        <AccordionTrigger
          className="p-4 text-lg font-semibold hover:no-underline hover:bg-accent/50"
          onClick={() => !list.isRead && handleMarkAsRead(list.id)}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3 text-left">
              {updatingLists[list.id] ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : list.isRead ? (
                <MailOpen className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Mail className="h-5 w-5 text-primary" />
              )}
              <div className="flex flex-col">
                <span className={`font-semibold ${!list.isRead && 'text-primary'}`}>{list.title}</span>
                <span className="text-xs text-muted-foreground">
                  Sent by {list.sentBy} • {list.sentAt ? formatDistanceToNow(list.sentAt.toDate(), { addSuffix: true }) : ''}
                </span>
              </div>
            </div>
            <Badge variant={list.listType === 'outstanding_fees' ? 'destructive' : 'secondary'} className="hidden sm:inline-flex">
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
                {list.students.map((student: any, index: number) => (
                  <TableRow key={`${list.id}-${student.name}-${index}`}>
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
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

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
            These are lists sent to you by the secretary. Expanding a list will automatically mark it as read.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>}
          {error && 
            <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-destructive mt-4">Error loading lists: {error.message}</p>
            </div>
          }
          {!isLoading && !error && (
            <AnimatePresence>
              {!lists || lists.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center text-muted-foreground py-24 border-2 border-dashed rounded-lg"
                >
                  <Inbox className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-xl font-semibold">Your inbox is empty.</p>
                  <p className="mt-2 text-sm">You have no lists from the secretary.</p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {/* Unread Section */}
                  {unreadLists.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">Unread</h3>
                      <Accordion type="multiple" className="w-full">
                        {unreadLists.map((list) => (
                           renderList(list)
                        ))}
                      </Accordion>
                    </div>
                  )}
                  
                  {unreadLists.length > 0 && readLists.length > 0 && <Separator />}

                  {/* Read Section */}
                  {readLists.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Read</h3>
                      <Accordion type="multiple" className="w-full">
                        {readLists.map((list) => (
                           renderList(list)
                        ))}
                      </Accordion>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
