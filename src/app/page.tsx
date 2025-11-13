'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, DollarSign, ListTodo, ShieldCheck, ArrowRight, Sparkles, Check, Star, TrendingUp, Award } from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const heroSlides = [
    {
      title: "Manage CBG",
      highlight: "Student Records",
      description: "Complete student management system for College Baptista de Gitwe with enrollment tracking, academic records, and dormitory assignments.",
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      gradient: "from-blue-600 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      title: "Track CBG",
      highlight: "School Finances",
      description: "Monitor fee payments, track student balances, and generate financial reports for College Baptista de Gitwe administration.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop",
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50"
    },
    {
      title: "Coordinate CBG",
      highlight: "Staff & Tasks",
      description: "Streamline communication between administrators, patrons, and matrons at College Baptista de Gitwe with AI-powered task management.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      gradient: "from-violet-600 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50"
    }
  ];

  const features = [
    {
      icon: <Users className="w-10 h-10 text-blue-500" />,
      title: 'Student Records',
      description: 'Manage CBG student enrollment, track academic performance, monitor attendance, and maintain complete student profiles.',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      stats: '500+ CBG Students',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=300&fit=crop'
    },
    {
      icon: <DollarSign className="w-10 h-10 text-emerald-500" />,
      title: 'Fee Management',
      description: 'Track CBG student fee payments, generate invoices, send payment reminders, and create comprehensive financial reports.',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      stats: '99% Collection Rate',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop'
    },
    {
      icon: <ListTodo className="w-10 h-10 text-violet-500" />,
      title: 'Staff Tasks',
      description: 'Coordinate daily tasks for CBG administrators, patrons, and matrons with AI-powered task lists and real-time updates.',
      gradient: 'from-violet-500/10 to-purple-500/10',
      stats: '50+ Staff Members',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-amber-500" />,
      title: 'Dormitory Management',
      description: 'Manage CBG dormitory assignments, track student utilities, and coordinate patron/matron responsibilities.',
      gradient: 'from-amber-500/10 to-orange-500/10',
      stats: 'All Dorms Covered',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'
    },
  ];

  const testimonials = [
    { 
      name: "Fr. Director of CBG", 
      role: "School Director", 
      text: "CampusConnect has transformed how we manage College Baptista de Gitwe. Everything is now organized and accessible.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    },
    { 
      name: "Jean-Paul Nkusi", 
      role: "CBG Financial Officer", 
      text: "Fee tracking for our students has never been easier. We've improved our collection rate significantly.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    { 
      name: "Grace Mukandori", 
      role: "CBG Matron", 
      text: "The dormitory management and task coordination features save us hours every week at CBG.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 px-6 lg:px-8 h-20 flex items-center backdrop-blur-xl bg-white/90 border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-r from-blue-600 to-violet-600 p-2 rounded-xl">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            CampusConnect
          </span>
        </div>
        <nav className="ml-auto flex gap-4">
          <button className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
            Login
          </button>
          <button className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105">
            Get Started
          </button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Dynamic Hero Section - Full Screen */}
        <section className="relative w-full h-screen flex items-center overflow-hidden">
          {/* Animated Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentHero.bgGradient} transition-all duration-1000`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-[10%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content Side */}
              <div className={`space-y-8 transition-all duration-700 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Built for College Baptista de Gitwe</span>
                </div>
                
                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                    <span className="text-slate-900">{currentHero.title}</span>
                    <br />
                    <span className={`bg-gradient-to-r ${currentHero.gradient} bg-clip-text text-transparent`}>
                      {currentHero.highlight}
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
                    {currentHero.description}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="group px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="px-8 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105">
                    Watch Demo
                  </button>
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-200">
                  <div>
                    <div className="text-4xl font-black text-slate-900">500+</div>
                    <div className="text-sm font-semibold text-slate-600 mt-1">CBG Students</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-slate-900">50+</div>
                    <div className="text-sm font-semibold text-slate-600 mt-1">CBG Staff</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-slate-900">8</div>
                    <div className="text-sm font-semibold text-slate-600 mt-1">Dormitories</div>
                  </div>
                </div>

                {/* Slide Indicators */}
                <div className="flex gap-3 pt-4">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsAnimating(true);
                        setTimeout(() => {
                          setCurrentSlide(index);
                          setIsAnimating(false);
                        }, 300);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index ? 'w-12 bg-gradient-to-r from-blue-600 to-violet-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Visual Side */}
              <div className={`relative transition-all duration-700 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div className="relative mx-auto max-w-2xl">
                  {/* Decorative Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentHero.gradient} opacity-20 blur-3xl rounded-[3rem] transition-all duration-1000`} />
                  
                  {/* Main Card with Real Image */}
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
                    <div className="aspect-[4/3]">
                      <img 
                        src={currentHero.image} 
                        alt={currentHero.highlight}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${currentHero.gradient} opacity-10`} />
                    </div>
                  </div>

                  {/* Floating Stats Cards */}
                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                    <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
                    <div className="text-2xl font-black text-slate-900">+40%</div>
                    <div className="text-sm font-semibold text-slate-600">Efficiency</div>
                  </div>

                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                    <Award className="w-8 h-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-black text-slate-900">CBG</div>
                    <div className="text-sm font-semibold text-slate-600">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-32 bg-slate-50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-6">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">Premium Features</span>
              </div>
              <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-6">
                Everything CBG Needs in
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"> One Platform</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
                Comprehensive school management tools designed specifically for College Baptista de Gitwe to enhance efficiency and communication.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="group relative bg-white rounded-3xl border-2 border-slate-200 hover:border-slate-300 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Feature Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} group-hover:opacity-80 transition-opacity duration-500`} />
                  </div>
                  
                  <div className="p-8">
                    <div className="mb-4 p-3 rounded-2xl bg-slate-50 w-fit">
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">{feature.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                      <Check className="w-4 h-4" />
                      {feature.stats}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-6">
                Trusted by CBG Staff
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                Hear from administrators, financial officers, and matrons at College Baptista de Gitwe
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 font-medium mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-600 font-semibold">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative w-full py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-white mb-6">
              Ready to Transform CBG?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12 font-medium">
              Join College Baptista de Gitwe in modernizing school management with our comprehensive platform.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="group px-10 py-5 text-lg font-bold text-blue-600 bg-white hover:bg-slate-50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 text-lg font-bold text-white border-2 border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:scale-105">
                Schedule Demo
              </button>
            </div>
            
            <p className="text-blue-100 text-sm mt-8 font-semibold">
              ✓ No credit card required  •  ✓ 14-day free trial  •  ✓ Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-2 rounded-xl">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold">CampusConnect</span>
              </div>
              <p className="text-slate-400 max-w-md font-medium leading-relaxed mb-6">
                The all-in-one school management platform built specifically for College Baptista de Gitwe (CBG).
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">X</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Security', 'Updates'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors font-semibold">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors font-semibold">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-semibold">
              © 2024 CampusConnect. All rights reserved. Built for College Baptista de Gitwe (CBG).
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors font-semibold">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors font-semibold">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}