import { NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { initAdmin } from '@/firebase/admin';

// Initialize Firebase Admin if not already initialized
initAdmin();

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();

    // Set custom claims for the developer
    await adminAuth().setCustomUserClaims(uid, {
      developer: true
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting developer claims:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set developer role' },
      { status: 500 }
    );
  }
}