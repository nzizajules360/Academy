
'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ShieldCheck, Bell, Power, SlidersHorizontal, AlertTriangle, UserX, Loader2 } from "lucide-react"
import { useFirestore } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useDocumentData } from "react-firebase-hooks/firestore"


function SystemControlsCard() {
    const firestore = useFirestore()
    const { toast } = useToast()
    const settingsRef = firestore ? doc(firestore, 'settings', 'developer') : null;
    const [settings, loading, error] = useDocumentData(settingsRef);

    const handleSettingChange = async (key: string, value: boolean) => {
        if (!settingsRef) return;
        try {
            await setDoc(settingsRef, { [key]: value }, { merge: true });
            toast({
                title: "Setting updated",
                description: `${key} has been ${value ? 'enabled' : 'disabled'}.`
            })
        } catch (err: any) {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
        }
    }
    
    if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
    if (error) return <p className="text-destructive">Error loading settings: {error.message}</p>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-background/50">
                <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode" className="text-base font-semibold">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable access for non-admin users.</p>
                </div>
                <Switch
                    id="maintenance-mode"
                    checked={settings?.maintenanceMode || false}
                    onCheckedChange={(value) => handleSettingChange('maintenanceMode', value)}
                    className="data-[state=checked]:bg-destructive"
                />
            </div>
             <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-background/50">
                <div className="space-y-0.5">
                    <Label htmlFor="new-feature-flag" className="text-base font-semibold">New Feature Flag</Label>
                    <p className="text-sm text-muted-foreground">Toggle visibility for an experimental feature.</p>
                </div>
                <Switch
                    id="new-feature-flag"
                    checked={settings?.newFeatureEnabled || false}
                    onCheckedChange={(value) => handleSettingChange('newFeatureEnabled', value)}
                />
            </div>
        </div>
    )
}

export default function DeveloperDashboard() {
  return (
    <div className="space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-primary"/>
                Developer Control Panel
            </h1>
            <p className="text-muted-foreground text-lg">
                High-level system administration and management tools.
            </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Power className="text-green-500"/>System Status</CardTitle>
                        <CardDescription>
                            At-a-glance overview of key system metrics.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-green-100/50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">API</p>
                            <p className="text-2xl font-bold text-green-600">Online</p>
                        </div>
                         <div className="p-4 bg-green-100/50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Database</p>
                            <p className="text-2xl font-bold text-green-600">Online</p>
                        </div>
                         <div className="p-4 bg-blue-100/50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">Users</p>
                            <p className="text-2xl font-bold text-blue-600">1,204</p>
                        </div>
                         <div className="p-4 bg-orange-100/50 rounded-lg">
                            <p className="text-sm font-medium text-orange-800">Logins (24h)</p>
                            <p className="text-2xl font-bold text-orange-600">342</p>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><SlidersHorizontal/> System Controls</CardTitle>
                        <CardDescription>
                           Enable or disable system-wide features in real-time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SystemControlsCard />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
