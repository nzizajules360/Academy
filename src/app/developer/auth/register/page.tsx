
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShieldCheck, Mail, Lock, ArrowRight, UserPlus, Key } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const ADMIN_SECRET_CODE = process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE;

export default function DeveloperRegisterPage() {
  const { user, loading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    displayName: '', 
    email: '', 
    password: '',
    secretCode: ''
  });
  
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && user && (user as any).role === 'developer') {
      router.push('/dashboard/developer/dashboard');
    }
  }, [user, userLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    
    if (formData.secretCode !== ADMIN_SECRET_CODE) {
      toast({
        variant: "destructive",
        title: "Invalid Secret Code",
        description: "The secret code for developer registration is incorrect.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: formData.displayName });

      await setDoc(doc(firestore, "users", newUser.uid), {
        uid: newUser.uid,
        displayName: formData.displayName,
        email: newUser.email,
        role: 'developer',
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Registration Successful",
        description: "Your developer account has been created. Redirecting to dashboard...",
        variant: "success",
      });

      router.push('/dashboard/developer/dashboard');

    } catch (error: any) {
      console.error(error);
      let errorMessage = "An unknown error occurred during registration.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak (must be at least 6 characters).";
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading || (!userLoading && user && (user as any).role === 'developer')) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <CardHeader className="text-center pt-8">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-xl mx-auto"
              >
                <UserPlus className="h-10 w-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold tracking-tight text-white">Developer Registration</CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Create a new account with developer privileges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                    <UserPlus className="h-4 w-4 text-blue-400" />
                    <span>Full Name</span>
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    placeholder="Your Name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span>Email Address</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="you@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-purple-400" />
                    <span>Password</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Min. 6 characters"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="secretCode" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                    <Key className="h-4 w-4 text-purple-400" />
                    <span>Secret Code</span>
                  </Label>
                  <Input
                    id="secretCode"
                    type="password"
                    value={formData.secretCode}
                    onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })}
                    required
                    placeholder="Required for registration"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      Create Developer Account
                      <ArrowRight className="ml-2 h-4 w-4"/>
                    </span>
                  )}
                </Button>
              </form>
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link href="/developer/auth/login" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
