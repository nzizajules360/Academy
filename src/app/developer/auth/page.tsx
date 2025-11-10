
'use client';
import { redirect } from 'next/navigation';

export default function DeveloperAuthRedirect() {
    redirect('/developer/auth/login');
}
