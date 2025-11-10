
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
import { doc } from "firebase/firestore"
import { useDocumentData } from "react-firebase-hooks/firestore"

function DeactivateUserForm() {
  const [target, setTarget] = useState('') // uid or email
  const [msg, setMsg] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) {
      toast({ variant: 'destructive', title: 'Enter UID or email' })
      return
    }
    setLoading(true)
    try {
      const payload: any = { message: msg || undefined, contact: contact || undefined }
      if (target.includes('@')) payload.email = target
      else payload.uid = target

      const res = await fetch('/api/developer/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to deactivate user')
      }

      toast({ title: 'User deactivated successfully' })
      setTarget('')
      setMsg('')
      setContact('')
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleDeactivate} className="space-y-4">
      <div>
        <Label htmlFor="deactivate-target">Target UID or Email</Label>
        <Input id="deactivate-target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="UID or email address" />
      </div>
      <div>
        <Label htmlFor="deactivate-msg">Message (shown to user)</Label>
        <Textarea id="deactivate-msg" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Optional: Your account has been temporarily disabled..." />
      </div>
      <div>
        <Label htmlFor="deactivate-contact">Contact (how they can reach you)</Label>
        <Input id="deactivate-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Optional: developer@example.com" />
      </div>
      <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin mr-2"/> : <UserX />}
        Deactivate User
      </Button>
    </form>
  )
}

function SystemNotificationForm() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [type, setType] = useState("info")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

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
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to send notification')
        }

        toast({
            title: "Success",
            description: "System notification sent successfully",
        })

        setTitle("")
        setMessage("")
        setType("info")
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
        <form onSubmit={handleSendNotification} className="space-y-4">
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2"/> : <Bell />}
              Send System Notification
            </Button>
        </form>
    )
}

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
            <div className="lg:col-span-2 space-y-8">
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Danger Zone</CardTitle>
                         <CardDescription>
                            High-impact actions that affect user accounts directly. Proceed with caution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DeactivateUserForm />
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

