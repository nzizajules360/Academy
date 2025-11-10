"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUser, useFirestore } from '@/firebase'
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export default function DeactivatedNotice() {
  const { user, loading } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const isDisabled = !!(user as any)?.disabled
  const disabledMessage = (user as any)?.disabledMessage || 'Your account is no longer active.'

  if (loading || !isDisabled) return null

  const handleSend = async () => {
    if (!firestore) return
    if (!message) {
      toast({ variant: 'destructive', title: 'Please enter a message' })
      return
    }

    setSending(true)
    try {
      // store support message under supportMessages collection
      await addDoc(collection(firestore, 'supportMessages'), {
        fromUid: user?.uid,
        message,
        createdAt: serverTimestamp(),
        handled: false,
      })

      toast({ title: 'Message sent', description: 'Developer will be notified.' })
      setMessage('')
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e.message || 'Failed to send message' })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Disabled</DialogTitle>
          <DialogDescription>
            {disabledMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-sm mb-2">If you believe this is an error, send a message to the developer:</p>
          <Textarea value={message} onChange={(e: any) => setMessage(e.target.value)} placeholder="Write a short message explaining the issue" />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => window.location.reload()} className="mr-2">Refresh</Button>
          <Button onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : 'Contact Developer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
