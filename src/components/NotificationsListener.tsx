"use client"

import { useEffect } from 'react'
import { useUser, useFirestore } from '@/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

export default function NotificationsListener() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()

  useEffect(() => {
    if (!user || !firestore) return
    const q = query(collection(firestore, `users/${user.uid}/notifications`), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          const data = change.doc.data() as any
          toast({ title: data.title || 'Notification', description: data.body || '' })
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

  return null
}
