'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { ShieldCheck, Bell, Power, SlidersHorizontal, Loader2, Server } from "lucide-react"
import { useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"


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

function SystemStatusCard() {
    const firestore = useFirestore();
    const settingsRef = firestore ? doc(firestore, 'settings', 'system') : null;
    const [settings, loading] = useDocumentData(settingsRef);
    const inMaintenance = settings?.maintenanceMode === true;
    
    const statusModules = [
        { key: 'userRegistration', label: 'Registration' },
        { key: 'financialModules', label: 'Financials' },
        { key: 'attendanceSystem', label: 'Attendance' },
        { key: 'refectoryManagement', label: 'Refectory' },
    ];

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Power/>System Status</CardTitle>
                    <CardDescription>
                        At-a-glance overview of key system metrics.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-24">
                    <Loader2 className="animate-spin h-8 w-8 text-primary"/>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Power className={inMaintenance ? "text-orange-500" : "text-green-500"}/>System Status</CardTitle>
                <CardDescription>
                    At-a-glance overview of key system modules.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4 text-center">
                <div className={`p-4 rounded-lg ${inMaintenance ? 'bg-orange-100/50' : 'bg-green-100/50'}`}>
                    <p className={`text-sm font-medium ${inMaintenance ? 'text-orange-800' : 'text-green-800'}`}>Overall</p>
                    <p className={`text-2xl font-bold ${inMaintenance ? 'text-orange-600' : 'text-green-600'}`}>{inMaintenance ? 'Maintenance' : 'Online'}</p>
                </div>
                {statusModules.map(module => {
                    const isEnabled = settings?.[module.key] ?? true;
                    return (
                         <div key={module.key} className={`p-4 rounded-lg ${isEnabled ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
                            <p className={`text-sm font-medium ${isEnabled ? 'text-green-800' : 'text-red-800'}`}>{module.label}</p>
                            <p className={`text-2xl font-bold ${isEnabled ? 'text-green-600' : 'text-red-600'}`}>{isEnabled ? 'Online' : 'Offline'}</p>
                        </div>
                    )
                })}
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
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><SlidersHorizontal/> System Controls</CardTitle>
                        <CardDescription>
                           Enable or disable system-wide features in real-time. Go to settings for more.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button asChild className="w-full">
                           <Link href="/developer/settings">Go to Settings</Link>
                       </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
