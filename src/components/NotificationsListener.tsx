
"use client"

import { useEffect } from 'react'
import { useUser, useFirestore } from '@/firebase'
import { collection, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export default function NotificationsListener() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()

  useEffect(() => {
    if (!user || !firestore) return
    
    // Listen for notifications created after the component mounts
    const q = query(
      collection(firestore, `users/${user.uid}/notifications`), 
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          // If the document has pending writes, it's a new local change.
          // If it's not from cache, it's a new server change we haven't seen.
          if (!change.doc.metadata.hasPendingWrites && change.doc.metadata.fromCache) {
            return;
          }

          const data = change.doc.data() as any
          
          toast({ 
            title: data.title || 'Notification', 
            description: data.body || '',
            variant: data.type === 'error' || data.type === 'payment-deadline' ? 'destructive' : 'default'
          })

          if (data.autoDownload && data.downloadUrl) {
            try {
              const res = await fetch(data.downloadUrl)
              const blob = await res.blob()
              // trigger download via anchor (avoid adding file-saver dependency)
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `report-${data.termId || Date.now()}.csv`
              document.body.appendChild(a)
              a.click()
              a.remove()
              URL.revokeObjectURL(url)
            } catch (e: any) {
              console.error('Auto-download failed', e)
            }
          }
        }
      })
    })

    return () => unsub()
  }, [user, firestore, toast])

  return null;
}

