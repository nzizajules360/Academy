import { NextResponse } from 'next/server';
import { initAdmin } from '@/firebase/admin';

export async function POST(request: Request) {
  try {
        const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Initialize Firebase Admin and get services
    const { auth } = initAdmin();

    try {
      // Set all developer permissions by default
      await auth.setCustomUserClaims(uid, {
        developer: true,
        role: 'developer',
        permissions: {
          canViewLogs: true,
          canDeploySystem: true,
          canManageUsers: true,
          canManageSettings: true
        },
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Developer claims set successfully'
      });
    } catch (authError: any) {
      console.error('Firebase Auth Error:', authError);
      return NextResponse.json(
        { 
          error: 'Failed to set custom claims',
          details: authError.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    );
  }
}