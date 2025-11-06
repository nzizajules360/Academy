'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, DollarSign, ListTodo, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <Users className="w-10 h-10 text-blue-500" />,
      title: 'Student Management',
      description: 'Effortlessly manage student records, track enrollment, and view detailed profiles. Keep all student information organized and accessible.',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      icon: <DollarSign className="w-10 h-10 text-emerald-500" />,
      title: 'Financial Tracking',
      description: 'Monitor fee collections, view payment statuses, and manage financial records with our intuitive financial tracking system.',
      gradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      icon: <ListTodo className="w-10 h-10 text-violet-500" />,
      title: 'Staff Coordination',
      description: 'Streamline daily tasks for administrators, patrons, and matrons. Track student utilities and generate AI-powered to-do lists.',
      gradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-amber-500" />,
      title: 'Role-Based Access',
      description: 'Secure, role-based dashboards for Admins, Secretaries, Patrons, and Matrons, ensuring everyone sees only what they need.',
      gradient: 'from-amber-500/10 to-orange-500/10',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header with backdrop blur */}
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-16 flex items-center backdrop-blur-lg bg-white/80 border-b border-slate-200/50 shadow-sm">
        <Link href="/" className="flex items-center justify-center group">
          <div className="relative">
            <GraduationCap className="h-7 w-7 text-blue-600 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 blur-xl bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors" />
          </div>
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            CampusConnect
          </span>
        </Link>
        <nav className="ml-auto flex gap-3">
          <Link href="/login" passHref>
            <Button variant="ghost" className="hover:bg-slate-100">Login</Button>
          </Link>
          <Link href="/register" passHref>
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25">
              Register
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section with Gradient Background */}
        <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-violet-50 to-cyan-50" />
          <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:radial-gradient(white,transparent_85%)]" />
          
          {/* Floating orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium border border-blue-200">
                  <Sparkles className="w-4 h-4" />
                  Trusted by College Baptista
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl leading-tight">
                    The All-in-One Platform for{' '}
                    <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                      College Baptista
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-slate-600 text-lg md:text-xl leading-relaxed">
                    CampusConnect streamlines school management by integrating student records, financial tracking, and staff coordination into a single, easy-to-use system.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/register" passHref>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/30 group">
                      Get Started
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button variant="outline" size="lg" className="border-2 hover:bg-slate-50">
                      Login
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-slate-900">500+</div>
                    <div className="text-sm text-slate-600">Students Managed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">50+</div>
                    <div className="text-sm text-slate-600">Staff Members</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">99%</div>
                    <div className="text-sm text-slate-600">Uptime</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center relative">
                <div className="relative w-full max-w-lg">
                  {/* Decorative cards */}
                  <div className="absolute -top-4 -left-4 w-64 h-64 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl opacity-20 blur-2xl" />
                  <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl opacity-20 blur-2xl" />
                  
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                    <GraduationCap className="w-full h-full text-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-28 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-4">
                <div className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-violet-100 px-4 py-1.5 text-sm font-semibold text-blue-700 border border-blue-200">
                  Key Features
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                  Everything You Need to{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Manage Your Campus
                  </span>
                </h2>
                <p className="max-w-[900px] text-slate-600 text-lg md:text-xl leading-relaxed">
                  From student enrollment to daily staff tasks, our platform provides the tools to enhance efficiency and communication across your institution.
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title} 
                  className="group border-2 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <CardHeader className="relative">
                    <div className="mb-4 p-3 rounded-2xl bg-slate-50 w-fit group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600" />
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_80%)]" />
          
          <div className="container relative z-10 grid items-center justify-center gap-6 px-4 text-center md:px-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl text-white">
                Ready to Modernize Your Campus Management?
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 text-lg md:text-xl leading-relaxed">
                Join CampusConnect today and transform the way you manage College Baptista.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-3 pt-2">
              <Link href="/register" passHref>
                <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-slate-50 shadow-2xl group">
                  Create an Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-blue-100 text-sm">No credit card required • Free trial available</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full items-center px-4 md:px-6 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} CampusConnect. Built for College Baptista.
          </p>
        </div>
        <nav className="sm:ml-auto flex gap-6">
          <p className="text-sm text-slate-500">All rights reserved.</p>
        </nav>
      </footer>
    </div>
  );
}