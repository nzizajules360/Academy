
'use client'

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Users, ToggleRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

function SystemControls() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const settingsRef = firestore ? doc(firestore, 'settings', 'system') : null;
    const [settings, loading, error] = useDocumentData(settingsRef);

    const handleSettingChange = async (key: string, value: boolean) => {
        if (!settingsRef) return;
        try {
            await setDoc(settingsRef, { [key]: value }, { merge: true });
            toast({
                title: "Setting Updated",
                description: `${key.replace(/([A-Z])/g, ' $1')} has been ${value ? 'enabled' : 'disabled'}.`
            });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
    if (error) return <p className="text-destructive">Error loading system settings: {error.message}</p>

    const systemToggles = [
        { id: 'userRegistration', label: 'User Registration', description: 'Allow new users to register.' },
        { id: 'financialModules', label: 'Financial Modules', description: 'Enable fee tracking and reporting.' },
        { id: 'attendanceSystem', label: 'Attendance System', description: 'Allow teachers to take attendance.' },
        { id: 'refectoryManagement', label: 'Refectory Management', description: 'Enable seating chart generation.' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemToggles.map(toggle => (
                <div key={toggle.id} className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-background/50 hover:border-primary/50 transition-colors">
                    <div className="space-y-0.5">
                        <Label htmlFor={toggle.id} className="text-base font-semibold">{toggle.label}</Label>
                        <p className="text-sm text-muted-foreground">{toggle.description}</p>
                    </div>
                    <Switch
                        id={toggle.id}
                        checked={settings?.[toggle.id] ?? true}
                        onCheckedChange={(value) => handleSettingChange(toggle.id, value)}
                    />
                </div>
            ))}
        </div>
    );
}

function UserManagement() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const usersQuery = firestore ? collection(firestore, 'users') : null;
    const [users, loading, error] = useCollectionData(usersQuery, { idField: 'uid' });
    const [updating, setUpdating] = useState<Record<string, boolean>>({});

    const handleStatusChange = async (uid: string, disabled: boolean) => {
        setUpdating(prev => ({ ...prev, [uid]: true }));
        try {
            const res = await fetch('/api/developer/toggle-user-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, disabled }),
            });

            if (!res.ok) {
                 const errorText = await res.text();
                 try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Failed to update user status');
                 } catch (e) {
                    throw new Error(errorText || 'An unknown error occurred');
                 }
            }

            toast({ title: 'Success', description: `User status updated successfully.` });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setUpdating(prev => ({ ...prev, [uid]: false }));
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>;
    if (error) return <p className="text-destructive">Error loading users: {error.message}</p>;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Status (Enabled)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users?.map(user => (
                    <TableRow key={user.uid}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.displayName}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {updating[user.uid] ? (
                                <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                            ) : (
                                <Switch
                                    checked={!user.disabled}
                                    onCheckedChange={(checked) => handleStatusChange(user.uid, !checked)}
                                    aria-label={`Toggle status for ${user.displayName}`}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function DeveloperSettingsPage() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary"/>
                    Developer Settings
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage system-wide configurations and user access controls.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ToggleRight /> System Modules</CardTitle>
                    <CardDescription>Enable or disable core features of the application in real-time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SystemControls />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> User Management</CardTitle>
                    <CardDescription>Activate or deactivate user accounts across the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserManagement />
                </CardContent>
            </Card>
        </motion.div>
    );
}
