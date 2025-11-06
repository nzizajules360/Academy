'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">
          Welcome to CampusConnect
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          The all-in-one management platform for College Baptista. Please select your role to continue.
        </p>
      </div>

      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Login or register to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
           <Link href="/login" passHref>
             <Button className='w-full'>Login</Button>
           </Link>
           <Link href="/register" passHref>
             <Button variant="outline" className='w-full'>Register</Button>
           </Link>
        </CardContent>
      </Card>
      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
        <p>Built for College Baptista.</p>
      </footer>
    </main>
  );
}
