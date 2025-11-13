
import { NextResponse } from 'next/server';
import { initAdmin } from '@/firebase/admin';
// import Twilio from 'twilio';

export async function POST(request: Request) {
  const { studentId } = await request.json();

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
  }

  const { firestore } = initAdmin();
  if (!firestore) {
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    // 1. Fetch student data
    const studentRef = firestore.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    const student = studentDoc.data()!;
    const parentPhone = student.parentPhone;

    if (!parentPhone) {
        return NextResponse.json({ error: 'Parent phone number is not available for this student.' }, { status: 400 });
    }

    // 2. Calculate outstanding fees
    const outstandingFees = (student.totalFees || 0) - (student.feesPaid || 0);

    // 3. Fetch required materials and determine missing ones
    const materialsSnapshot = await firestore.collection('materials').where('required', '==', true).get();
    const requiredMaterials = materialsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const presentMaterialIds = new Set((student.utilities || []).filter((u: any) => u.status === 'present').map((u: any) => u.materialId));
    const missingMaterials = requiredMaterials.filter(m => !presentMaterialIds.has(m.id)).map((m: any) => m.name);

    // 4. Construct the SMS message
    let messageBody = `Dear Parent of ${student.name},\nThis is an update from College Baptista de Gitwe.\n`;
    let hasIssues = false;

    if (outstandingFees > 0) {
      messageBody += `\nOutstanding Fees: RWF ${outstandingFees.toLocaleString()}.\n`;
      hasIssues = true;
    }

    if (missingMaterials.length > 0) {
      messageBody += `\nMissing Items: ${missingMaterials.join(', ')}.\n`;
      hasIssues = true;
    }
    
    if (!hasIssues) {
        messageBody += `\nYour child's records show no outstanding fees or missing required items. Thank you for your support!`;
    } else {
        messageBody += `\nPlease address these issues at your earliest convenience.`
    }


    // 5. Send SMS (Placeholder)
    // ==========================
    // UNCOMMENT THE FOLLOWING CODE AND ADD YOUR TWILIO CREDENTIALS TO .env
    // ==========================
    /*
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials are not set in .env file');
      return NextResponse.json({ error: 'SMS service is not configured.' }, { status: 500 });
    }
    const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: parentPhone, // Make sure this is a valid E.164 formatted number
    });
    */

    // For now, we will just log it to the console
    console.log("--- SMS 'RED NOTICE' PREPARED ---");
    console.log("To:", parentPhone);
    console.log("Body:", messageBody);
    console.log("---------------------------------");

    return NextResponse.json({ success: true, message: 'SMS prepared and logged.', details: messageBody });

  } catch (error: any) {
    console.error('Error preparing SMS:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
