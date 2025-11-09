'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DeveloperDashboard() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("info")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Here you would implement the logic to send the notification
      // This could be through Firebase Cloud Messaging or your own notification system
      
      // Example implementation with Firebase Cloud Messaging:
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          type,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }

      toast({
        title: "Success",
        description: "System notification sent successfully",
      })

      // Clear the form
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
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Developer Dashboard</CardTitle>
          <CardDescription>
            Send system-wide notifications to users about updates, maintenance, or important messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter notification title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Enter your message"
                className="min-h-[150px]"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send System Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )