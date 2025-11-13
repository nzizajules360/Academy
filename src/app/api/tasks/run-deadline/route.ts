
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

    const { admin, firestore, auth, storage, messaging } = initAdmin();

    if (!admin || !firestore || !auth || !storage || !messaging) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // Find students in this term with outstanding fees
    const studentsSnap = await firestore.collection('students').where('termId', '==', termId).get()
    const overdue: Array<Record<string, any>> = []
    for (const doc of studentsSnap.docs) {
      const data = doc.data()
      const feesPaid = data.feesPaid || 0
      const totalFees = data.totalFees || 0
      if (feesPaid < totalFees) {
        overdue.push({ 
            uid: doc.id, 
            name: data.name || 'N/A', 
            email: data.email || '', 
            feesPaid, 
            totalFees,
            outstanding: totalFees - feesPaid
        })
      }
    }

    // create CSV
    const csv = makeCsv(overdue.length > 0 ? overdue : [{ uid: '', name: '', email: '', feesPaid: 0, totalFees: 0, outstanding: 0}]);
    const timestamp = Date.now()
    const filePath = `reports/debt-${termId}-${timestamp}.csv`

    let downloadUrl: string | null = null;
    if (overdue.length > 0) {
      try {
        const bucket = storage.bucket();
        const file = bucket.file(filePath);
        await file.save(Buffer.from(csv || ''), { contentType: 'text/csv' });
        const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 1000 * 60 * 60 });
        downloadUrl = url;
      } catch (e) {
        // fallback: store csv in Firestore report doc
        const repRef = await firestore.collection('reports').add({ termId, csv, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        downloadUrl = `/api/tasks/report/${repRef.id}`;
      }
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      termId,
    }

    // helper to notify a single user (store doc + send FCM if tokens exist)
    async function notifyUser(uid: string, extra: any = {}) {
      await firestore.collection('users').doc(uid).collection('notifications').add({ ...payload, ...extra, read: false })
      // send FCM to tokens
      const tokensSnap = await firestore.collection('users').doc(uid).collection('fcmTokens').get()
      const tokens = tokensSnap.docs.map(d => d.id)
      if (tokens.length > 0) {
        await messaging.sendEachForMulticast({
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
      await notifyUser(h.id, { repeatUntilRead: true, lastRemindedAt: admin.firestore.FieldValue.serverTimestamp() })
    }

    return NextResponse.json({ success: true, count: overdue.length, downloadUrl })
  } catch (error: any) {
    console.error('run-deadline error', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
