
import { NextResponse } from 'next/server'
import { initAdmin } from '@/firebase/admin'

export async function POST() {
  try {
    const { firestore, messaging } = initAdmin();

    if (!firestore || !messaging) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // find unread HR notifications that have repeatUntilRead true
    const hrUsers = await firestore.collection('users').where('role', '==', 'hr').get()
    for (const u of hrUsers.docs) {
      const notifSnap = await firestore.collection('users').doc(u.id).collection('notifications').where('repeatUntilRead', '==', true).where('read', '==', false).get()
      for (const n of notifSnap.docs) {
        const data = n.data()
        // resend FCM
        const tokensSnap = await firestore.collection('users').doc(u.id).collection('fcmTokens').get()
        const tokens = tokensSnap.docs.map(d => d.id)
        if (tokens.length > 0) {
          await messaging.sendEachForMulticast({ tokens, notification: { title: data.title || 'Reminder', body: data.body || '' } })
        }
        await n.ref.update({ lastRemindedAt: new Date().toISOString() })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('remind-hr error', e)
    return NextResponse.json({ error: e.message || 'error' }, { status: 500 })
  }
}
