import { NextResponse } from 'next/server'
import { initAdmin } from '@/firebase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { uid, email, message, contact } = body || {}

    if (!uid && !email) {
      return NextResponse.json({ error: 'Missing target uid or email' }, { status: 400 })
    }

    const { auth, firestore } = initAdmin()

    let targetUid = uid
    // resolve email to uid if email provided
    if (!targetUid && email) {
      const userRecord = await auth.getUserByEmail(email)
      targetUid = userRecord.uid
    }

    // Disable the Firebase Auth user (prevents sign-in)
    await auth.updateUser(targetUid!, { disabled: true })

    // Annotate the user's Firestore document with disabled info
    const userDocRef = firestore.collection('users').doc(targetUid!)
    await userDocRef.set(
      {
        disabled: true,
        disabledMessage: message || 'Your account has been deactivated by a developer.',
        disabledBy: 'developer',
        disabledContact: contact || null,
        disabledAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to deactivate user:', error)
    return NextResponse.json({ error: error.message || 'Failed to deactivate user' }, { status: 500 })
  }
}
