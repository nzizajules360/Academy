
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
import { ShieldCheck, Bell, Power, SlidersHorizontal, AlertTriangle, UserX, Loader2, Server } from "lucide-react"
import { useFirestore } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useDocumentData } from "react-firebase-hooks/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

function SystemNotificationForm() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [type, setType] = useState("info")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
        const response = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message, type, broadcast: true }),
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send notification')
        }

        toast({
            title: "Success",
            description: "System notification sent successfully",
        })

        setTitle("")
        setMessage("")
        setType("info")
        setIsOpen(false)
        } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to send notification",
        })
        } finally {
        setLoading(false)
        }
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="w-full">
                <Bell className="mr-2"/>
                Send System Notification
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Broadcast System Notification</DialogTitle>
                        <DialogDescription>
                            This message will be sent to all users of the application.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSendNotification} className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Notification Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. System Maintenance" />
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label htmlFor="type">Notification Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger id="type">
                                <SelectValue placeholder="Select notification type" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="info">Information</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="message">Message Content</Label>
                            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Enter your message" className="min-h-[120px]" />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin mr-2"/> : <Bell />}
                                Send Notification
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

function SystemControlsCard() {
    const firestore = useFirestore()
    const { toast } = useToast()
    const settingsRef = firestore ? doc(firestore, 'settings', 'system') : null;
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

function SystemStatusCard() {
    const firestore = useFirestore();
    const settingsRef = firestore ? doc(firestore, 'settings', 'system') : null;
    const [settings, loading] = useDocumentData(settingsRef);
    const inMaintenance = settings?.maintenanceMode === true;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Power className={inMaintenance ? "text-orange-500" : "text-green-500"}/>System Status</CardTitle>
                <CardDescription>
                    At-a-glance overview of key system metrics.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
                <div className={`p-4 rounded-lg ${inMaintenance ? 'bg-orange-100/50' : 'bg-green-100/50'}`}>
                    <p className={`text-sm font-medium ${inMaintenance ? 'text-orange-800' : 'text-green-800'}`}>System</p>
                    <p className={`text-2xl font-bold ${inMaintenance ? 'text-orange-600' : 'text-green-600'}`}>{inMaintenance ? 'Maintenance' : 'Online'}</p>
                </div>
                 <div className="p-4 bg-green-100/50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Database</p>
                    <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
            </CardContent>
        </Card>
    );
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
            <div className="lg:col-span-2 space-y-8">
                <SystemStatusCard />

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

            {/* Right Column */}
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bell/> System Notifications</CardTitle>
                        <CardDescription>
                            Send a broadcast notification to all users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <SystemNotificationForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
