
import { NextResponse } from 'next/server'
import { initAdmin } from '@/firebase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { uid, disabled } = body || {}

    if (!uid) {
      return NextResponse.json({ error: 'Missing target UID' }, { status: 400 })
    }

    const { auth, firestore } = initAdmin()

    // Update Firebase Auth user
    await auth.updateUser(uid, { disabled })

    // Update the user's Firestore document
    const userDocRef = firestore.collection('users').doc(uid)
    await userDocRef.set(
      {
        disabled: disabled,
        disabledMessage: disabled ? 'Your account has been deactivated by a developer.' : null,
      },
      { merge: true }
    )

    return NextResponse.json({ success: true, message: `User ${disabled ? 'deactivated' : 'activated'}` })
  } catch (error: any) {
    console.error('Failed to toggle user status:', error)
    return NextResponse.json({ error: error.message || 'Failed to toggle user status' }, { status: 500 })
  }
}
