
'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ShieldCheck, Bell, Power, SlidersHorizontal, AlertTriangle, UserX, Loader2, Database, Users, Activity, TrendingUp, AlertCircle, Send, ServerCog } from "lucide-react"
import { useFirestore } from "@/firebase"
import { doc, setDoc, updateDoc, collection, query, where, getDocs, getDoc } from "firebase/firestore"
import { useDocumentData, useCollectionData } from "react-firebase-hooks/firestore"
import { motion } from "framer-motion"
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"


function DeactivateUserForm() {
  const firestore = useFirestore()
  const [target, setTarget] = useState('')
  const [msg, setMsg] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target || !firestore) {
      toast({ variant: 'destructive', title: 'Enter UID or email' })
      return
    }
    setLoading(true)
    try {
      let userDocRef;
      
      // Check if target is email or UID
      if (target.includes('@')) {
        // Search for user by email
        const usersRef = collection(firestore, 'users')
        const q = query(usersRef, where('email', '==', target))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          throw new Error('User not found with this email')
        }
        
        userDocRef = querySnapshot.docs[0].ref
      } else {
        // Direct UID lookup
        userDocRef = doc(firestore, 'users', target)
        const userDoc = await getDoc(userDocRef)
        
        if (!userDoc.exists()) {
          throw new Error('User not found with this UID')
        }
      }

      const updateData = {
        disabled: true,
        disabledMessage: msg || 'Your account has been deactivated by an administrator.',
        disabledContact: contact || null,
        disabledAt: new Date().toISOString(),
      }

      await updateDoc(userDocRef, updateData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

      toast({ title: 'Success', description: 'User deactivated successfully' })
      setTarget('')
      setMsg('')
      setContact('')
    } catch (err: any) {
      if (!(err instanceof FirestorePermissionError)) {
        toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to deactivate user' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleDeactivate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deactivate-target" className="text-sm font-medium">Target UID or Email</Label>
        <Input 
          id="deactivate-target" 
          value={target} 
          onChange={(e) => setTarget(e.target.value)} 
          placeholder="user@example.com or uid123" 
          className="border-destructive/50 focus:border-destructive"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deactivate-msg" className="text-sm font-medium">Message (shown to user)</Label>
        <Textarea 
          id="deactivate-msg" 
          value={msg} 
          onChange={(e) => setMsg(e.target.value)} 
          placeholder="Your account has been temporarily disabled due to..." 
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deactivate-contact" className="text-sm font-medium">Contact Info</Label>
        <Input 
          id="deactivate-contact" 
          value={contact} 
          onChange={(e) => setContact(e.target.value)} 
          placeholder="support@example.com" 
        />
      </div>
      <Button type="submit" variant="destructive" className="w-full gap-2" disabled={loading}>
        {loading ? <Loader2 className="animate-spin h-4 w-4"/> : <UserX className="h-4 w-4" />}
        Deactivate User Account
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
            variant: type === 'success' ? 'success' : 'default',
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <Bell className="mr-2"/>
                    Broadcast Message
                </Button>
            </DialogTrigger>
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
                            {loading ? <Loader2 className="animate-spin mr-2"/> : <Send />}
                            Send Notification
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
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
                title: "Setting Updated",
                description: `${key.replace(/([A-Z])/g, ' $1')} has been ${value ? 'enabled' : 'disabled'}.`
            })
        } catch (err: any) {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
        }
    }
    
    if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>
    if (error) return <p className="text-destructive">Error loading settings: {error.message}</p>

    const systemControls = [
      {
        id: 'maintenanceMode',
        label: 'Maintenance Mode',
        description: 'Temporarily disable access for non-admin users',
        icon: ServerCog,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        destructive: true
      },
      {
        id: 'newFeatureEnabled',
        label: 'New Feature Flag',
        description: 'Toggle visibility for experimental features',
        icon: Activity,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        destructive: false
      }
    ]

    return (
        <div className="space-y-4">
            {systemControls.map((control) => {
              const Icon = control.icon
              const isEnabled = settings?.[control.id] || false
              
              return (
                <Card key={control.id} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`${control.bgColor} p-2.5 rounded-lg`}>
                          <Icon className={`h-5 w-5 ${control.color}`} />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={control.id} className="text-base font-semibold cursor-pointer">
                              {control.label}
                            </Label>
                            {isEnabled && (
                              <Badge variant={control.destructive ? "destructive" : "default"} className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{control.description}</p>
                        </div>
                      </div>
                      <Switch
                        id={control.id}
                        checked={isEnabled}
                        onCheckedChange={(value) => handleSettingChange(control.id, value)}
                        className={control.destructive ? "data-[state=checked]:bg-destructive" : ""}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
    )
}

function SystemStatusCard() {
  const firestore = useFirestore()
  const usersQuery = firestore ? collection(firestore, 'users') : null;
  const [users] = useCollectionData(usersQuery);
  const [recentLogins, setRecentLogins] = useState(0)

  useEffect(() => {
    if (!users) return
    // Calculate logins in last 24 hours
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    
    const recent = users.filter(user => {
      if (!user.lastLogin) return false
      const loginDate = new Date(user.lastLogin)
      return loginDate > yesterday
    }).length
    
    setRecentLogins(recent)
  }, [users])

  const stats = [
    {
      label: 'API',
      value: 'Online',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100/50',
      darkBg: 'dark:bg-emerald-900/20',
      icon: Power
    },
    {
      label: 'Database',
      value: firestore ? 'Online' : 'Offline',
      color: firestore ? 'text-emerald-600' : 'text-red-600',
      bgColor: firestore ? 'bg-emerald-100/50' : 'bg-red-100/50',
      darkBg: firestore ? 'dark:bg-emerald-900/20' : 'dark:bg-red-900/20',
      icon: Database
    },
    {
      label: 'Total Users',
      value: users?.length.toLocaleString() || '0',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100/50',
      darkBg: 'dark:bg-blue-900/20',
      icon: Users
    },
    {
      label: 'Active (24h)',
      value: recentLogins.toLocaleString(),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100/50',
      darkBg: 'dark:bg-orange-900/20',
      icon: TrendingUp
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${stat.bgColor} ${stat.darkBg} border-2`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-background/50 p-2 rounded-lg">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${stat.color}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function DeveloperDashboard() {
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
                Developer Control Panel
            </h1>
            <p className="text-muted-foreground text-lg">
                High-level system administration and management tools powered by Firebase.
            </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Power className="text-emerald-500 h-6 w-6"/>
                          System Status
                        </CardTitle>
                        <CardDescription className="text-base">
                            Real-time overview of key system metrics and health indicators.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SystemStatusCard />
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <SlidersHorizontal className="h-6 w-6"/> 
                          System Controls
                        </CardTitle>
                        <CardDescription className="text-base">
                           Enable or disable system-wide features in real-time via Firebase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SystemControlsCard />
                    </CardContent>
                </Card>

                <Card className="border-2 border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive text-2xl">
                          <AlertTriangle className="h-6 w-6"/>
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-base">
                            High-impact actions that affect user accounts directly. Changes are written to Firebase immediately.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-destructive/5 p-4 rounded-lg border-2 border-destructive/20 mb-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-destructive">Warning: Irreversible Action</p>
                              <p className="text-xs text-muted-foreground">
                                Deactivating a user will immediately prevent them from accessing the system. This action updates the user document in Firestore.
                              </p>
                            </div>
                          </div>
                        </div>
                        <DeactivateUserForm />
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Bell className="h-6 w-6"/> 
                          System Notifications
                        </CardTitle>
                        <CardDescription className="text-base">
                            Broadcast messages to all users via Firebase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <SystemNotificationForm />
                    </CardContent>
                </Card>

                <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                      <p className="text-muted-foreground">All changes are saved directly to Firebase Firestore</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                      <p className="text-muted-foreground">User deactivation updates the user's document immediately</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                      <p className="text-muted-foreground">System notifications are stored in the systemNotifications collection</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                      <p className="text-muted-foreground">Feature flags are stored in settings/developer document</p>
                    </div>
                  </CardContent>
                </Card>
            </div>
        </div>
    </motion.div>
  );
}
