'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, DollarSign, ListTodo, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <Users className="w-8 h-8 mb-4 text-primary" />,
      title: 'Student Management',
      description: 'Effortlessly manage student records, track enrollment, and view detailed profiles. Keep all student information organized and accessible.',
    },
    {
      icon: <DollarSign className="w-8 h-8 mb-4 text-primary" />,
      title: 'Financial Tracking',
      description: 'Monitor fee collections, view payment statuses, and manage financial records with our intuitive financial tracking system.',
    },
    {
      icon: <ListTodo className="w-8 h-8 mb-4 text-primary" />,
      title: 'Staff Coordination',
      description: 'Streamline daily tasks for administrators, patrons, and matrons. Track student utilities and generate AI-powered to-do lists.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 mb-4 text-primary" />,
      title: 'Role-Based Access',
      description: 'Secure, role-based dashboards for Admins, Secretaries, Patrons, and Matrons, ensuring everyone sees only what they need.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm">
        <Link href="/" className="flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">CampusConnect</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" passHref>
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register" passHref>
            <Button>Register</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                   <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    The All-in-One Platform for College Baptista
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    CampusConnect streamlines school management by integrating student records, financial tracking, and staff coordination into a single, easy-to-use system.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register" passHref>
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button variant="outline" size="lg">Login</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <GraduationCap className="w-48 h-48 lg:w-64 lg:h-64 text-primary/10" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Manage Your Campus</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From student enrollment to daily staff tasks, our platform provides the tools to enhance efficiency and communication across your institution.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center p-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Modernize Your Campus Management?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join CampusConnect today and transform the way you manage College Baptista.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
                <Link href="/register" passHref>
                    <Button className="w-full">Create an Account</Button>
                </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} CampusConnect. Built for College Baptista.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <p className="text-xs text-muted-foreground">All rights reserved.</p>
        </nav>
      </footer>
    </div>
  );
}
