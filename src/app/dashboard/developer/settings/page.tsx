'use client'

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Users, ToggleRight, UserPlus, DollarSign, ClipboardCheck, Utensils, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
        {
          id: 'maintenanceMode',
          label: 'Maintenance Mode',
          description: 'Take the site offline for non-admin users.',
          destructive: true
        },
        { 
            id: 'userRegistration', 
            label: 'User Registration', 
            description: 'Allow new users to register and create accounts.',
        },
        { 
            id: 'financialModules', 
            label: 'Financial Modules', 
            description: 'Enable fee tracking, payments, and financial reporting.',
        },
        { 
            id: 'attendanceSystem', 
            label: 'Attendance System', 
            description: 'Allow teachers to record and track student attendance.',
        },
        { 
            id: 'refectoryManagement', 
            label: 'Refectory Management', 
            description: 'Enable meal planning and seating chart generation.',
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {systemToggles.map((toggle, index) => {
                const isEnabled = settings?.[toggle.id] ?? (toggle.id === 'maintenanceMode' ? false : true);
                
                return (
                    <motion.div
                        key={toggle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group">
                             <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={toggle.id} className="text-base font-semibold cursor-pointer">
                                                {toggle.label}
                                            </Label>
                                            <Badge 
                                                variant={isEnabled ? (toggle.destructive ? "destructive" : "default") : "secondary"}
                                                className="text-xs"
                                            >
                                                {isEnabled ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {toggle.description}
                                        </p>
                                    </div>
                                    
                                    <Switch
                                        id={toggle.id}
                                        checked={isEnabled}
                                        onCheckedChange={(value) => handleSettingChange(toggle.id, value)}
                                        className={toggle.destructive ? "data-[state=checked]:bg-destructive" : ""}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}

function UserManagement() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const usersQuery = firestore ? collection(firestore, 'users') : null;
    const [users, loading, error] = useCollectionData(usersQuery, { idField: 'uid' });
    const [updating, setUpdating] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const handleStatusChange = async (uid: string, disabled: boolean) => {
        if (!firestore) return;
        setUpdating(prev => ({ ...prev, [uid]: true }));
        try {
            const userDocRef = doc(firestore, 'users', uid);
            const updateData = {
                disabled,
                disabledMessage: disabled ? 'Your account has been deactivated by a developer.' : null,
            };
            await updateDoc(userDocRef, updateData).catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updateData,
                });
                errorEmitter.emit('permission-error', permissionError);
                throw serverError;
            });

            toast({ title: 'Success', description: `User status updated successfully.` });
        } catch (err: any) {
            if (!(err instanceof FirestorePermissionError)) {
                toast({ variant: 'destructive', title: 'Error', description: err.message });
            }
        } finally {
            setUpdating(prev => ({ ...prev, [uid]: false }));
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>;
    if (error) return <p className="text-destructive">Error loading users: {error.message}</p>;

    const filteredUsers = users?.filter(user => {
        const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    }) || [];

    const stats = {
        total: users?.length || 0,
        active: users?.filter(u => !u.disabled).length || 0,
        inactive: users?.filter(u => u.disabled).length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                    <p className="text-3xl font-bold mt-2">{stats.total}</p>
                                </div>
                                <div className="bg-blue-500/10 p-3 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                                    <p className="text-3xl font-bold mt-2 text-emerald-500">{stats.active}</p>
                                </div>
                                <div className="bg-emerald-500/10 p-3 rounded-xl">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-2">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                                    <p className="text-3xl font-bold mt-2 text-destructive">{stats.inactive}</p>
                                </div>
                                <div className="bg-destructive/10 p-3 rounded-xl">
                                    <XCircle className="h-6 w-6 text-destructive" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Role: {roleFilter === 'all' ? 'All' : roleFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setRoleFilter('all')}>All Roles</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter('admin')}>Admin</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter('teacher')}>Teacher</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter('secretary')}>Secretary</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter('patron')}>Patron</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter('matron')}>Matron</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Users Table */}
            <Card className="border-2">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">User</TableHead>
                            <TableHead className="font-semibold">Role</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user.uid}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b"
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2">
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.displayName}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize font-medium">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {user.disabled ? (
                                                <>
                                                    <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                                    <span className="text-sm text-destructive font-medium">Disabled</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-sm text-emerald-500 font-medium">Active</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {updating[user.uid] ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            ) : (
                                                <Switch
                                                    checked={!user.disabled}
                                                    onCheckedChange={(checked) => handleStatusChange(user.uid, !checked)}
                                                    aria-label={`Toggle status for ${user.displayName}`}
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </Card>
        </div>
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
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <ShieldCheck className="h-8 w-8 text-primary"/>
                    </div>
                    Developer Settings
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage system-wide configurations and user access controls with advanced features.
                </p>
            </div>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <ToggleRight className="h-6 w-6" /> 
                        System Modules
                    </CardTitle>
                    <CardDescription className="text-base">
                        Enable or disable core features of the application in real-time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SystemControls />
                </CardContent>
            </Card>
            
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Users className="h-6 w-6" /> 
                        User Management
                    </CardTitle>
                    <CardDescription className="text-base">
                        Activate or deactivate user accounts and manage permissions across the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserManagement />
                </CardContent>
            </Card>
        </motion.div>
    );
}
