import { NextResponse } from 'next/server'
import { initAdmin } from '@/firebase/admin'

export async function POST(request: Request) {
  try {
    const { email, secretCode } = await request.json()
    
    // Verify secret code
    if (secretCode !== 'fabdevjulesdev') {
      return NextResponse.json(
        { error: 'Invalid secret code' },
        { status: 403 }
      )
    }

    const { auth } = initAdmin()

    // Get user by email
    const user = await auth.getUserByEmail(email)
    
    // Set developer claims
    await auth.setCustomUserClaims(user.uid, {
      developer: true,
      role: 'developer',
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Developer role granted. Please log out and log back in.' 
    })
  } catch (error: any) {
    console.error('Failed to grant developer role:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to grant developer role' },
      { status: 500 }
    )
  }
}