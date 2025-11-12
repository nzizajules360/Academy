
import { NextResponse } from "next/server"
import { initAdmin } from '@/firebase/admin'

export async function POST(request: Request) {
  try {
    const { admin, firestore, messaging } = initAdmin();
    
    if (!admin || !firestore || !messaging) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const payload = await request.json()
    const { title, message, type, broadcast } = payload || {}

    if (!title || !message || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store central broadcast record
    const record = { title, message, type, createdAt: admin.firestore.FieldValue.serverTimestamp(), broadcast: !!broadcast }
    await firestore.collection('notifications').add(record)

    if (broadcast) {
      // Send to all users' FCM tokens
      const usersSnap = await firestore.collection('users').get()
      const allTokens: string[] = []
      for (const u of usersSnap.docs) {
        const tokensSnap = await firestore.collection('users').doc(u.id).collection('fcmTokens').get()
        for (const t of tokensSnap.docs) allTokens.push(t.id)
        // store a per-user notification doc for persistence
        await firestore.collection('users').doc(u.id).collection('notifications').add({
          title,
          body: message,
          type,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }

      if (allTokens.length > 0) {
        // chunk tokens into batches of 500 for sendMulticast
        const batches: string[][] = []
        for (let i = 0; i < allTokens.length; i += 500) batches.push(allTokens.slice(i, i + 500))
        for (const batch of batches) {
          await messaging.sendEachForMulticast({ tokens: batch, notification: { title, body: message } })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
