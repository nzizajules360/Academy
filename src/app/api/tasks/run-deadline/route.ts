import { NextResponse } from 'next/server'
import { initAdmin } from '@/firebase/admin'

function makeCsv(rows: Array<Record<string, any>>) {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const r of rows) {
    const values = headers.map(h => {
      const v = r[h]
      if (v == null) return ''
      const s = String(v).replace(/"/g, '""')
      return `"${s}"`
    })
    lines.push(values.join(','))
  }
  return lines.join('\n')
}

export async function POST(request: Request) {
  try {
    const { termId } = await request.json()
    if (!termId) return NextResponse.json({ error: 'termId required' }, { status: 400 })

    const { firestore, auth } = initAdmin()
    const admin = await import('firebase-admin')

    // Find students in this term with outstanding fees
    const studentsSnap = await firestore.collection('students').where('termId', '==', termId).get()
    const overdue: Array<Record<string, any>> = []
    for (const doc of studentsSnap.docs) {
      const data = doc.data()
      const feesPaid = data.feesPaid || 0
      const totalFees = data.totalFees || 0
      if (feesPaid < totalFees) {
        overdue.push({ uid: data.uid || doc.id, name: data.displayName || data.name || '', email: data.email || '', feesPaid, totalFees })
      }
    }

    // create CSV
    const csv = makeCsv(overdue)
    const timestamp = Date.now()
    const filePath = `reports/debt-${termId}-${timestamp}.csv`

    let downloadUrl: string | null = null
    try {
      const bucket = admin.storage().bucket()
      const file = bucket.file(filePath)
      await file.save(Buffer.from(csv || ''), { contentType: 'text/csv' })
      const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 })
      downloadUrl = url
    } catch (e) {
      // fallback: store csv in Firestore report doc
      const repRef = await firestore.collection('reports').add({ termId, csv, createdAt: new Date().toISOString() })
      downloadUrl = `/api/tasks/report/${repRef.id}`
    }

    // Notify secretaries
    const secretaries = await firestore.collection('users').where('role', '==', 'secretary').get()
    const hrUsers = await firestore.collection('users').where('role', '==', 'hr').get()

    const payload = {
      title: 'Payment Deadline Reached',
      body: `${overdue.length} students have outstanding fees for term ${termId}`,
      type: 'payment-deadline',
      downloadUrl,
      autoDownload: true,
      createdAt: new Date().toISOString(),
      termId,
    }

    const messaging = admin.messaging()

    // helper to notify a single user (store doc + send FCM if tokens exist)
    async function notifyUser(uid: string, extra: any = {}) {
      const notifRef = firestore.collection('users').doc(uid).collection('notifications').doc(String(Date.now()))
      await notifRef.set({ ...payload, ...extra, read: false })
      // send FCM to tokens
      const tokensSnap = await firestore.collection('users').doc(uid).collection('fcmTokens').get()
      const tokens = tokensSnap.docs.map(d => d.id)
      if (tokens.length > 0) {
        await messaging.sendMulticast({
          tokens,
          notification: { title: payload.title, body: payload.body },
          data: { downloadUrl: String(downloadUrl || ''), autoDownload: 'true' }
        })
      }
    }

    // notify all secretaries
    for (const s of secretaries.docs) {
      await notifyUser(s.id)
    }

    // notify HR users with repeatUntilRead flag
    for (const h of hrUsers.docs) {
      await notifyUser(h.id, { repeatUntilRead: true, lastRemindedAt: new Date().toISOString() })
    }

    return NextResponse.json({ success: true, count: overdue.length, downloadUrl })
  } catch (error: any) {
    console.error('run-deadline error', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
