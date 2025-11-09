import { NextResponse } from 'next/server';
import { initAdmin } from '@/firebase/admin';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Initialize Firebase Admin and get services
    const { auth, firestore } = initAdmin();

    // Check developer status in Firestore
    const developerDoc = await firestore.collection('developers').doc(uid).get();
    
    if (!developerDoc.exists) {
      return NextResponse.json({ error: 'Developer account not found' }, { status: 404 });
    }

    const developerData = developerDoc.data();
    if (developerData?.status !== 'approved') {
      return NextResponse.json(
        { error: 'Developer account not approved' }, 
        { status: 403 }
      );
    }

    // Set custom claims for the user
    await auth.setCustomUserClaims(uid, {
      developer: true
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error setting developer claims:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set developer claims' },
      { status: 500 }
    );
  }
}