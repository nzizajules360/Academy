
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Loader2, GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function LoginPage() {
  const { user, loading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleValidation = () => {
    const newErrors = { email: '', password: '' };
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation() || !auth) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      const errorCode = error.code;
      let errorMessage = "An unknown error occurred.";
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: "Could not sign in with Google. Please try again or use email/password.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  if (userLoading || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <a href="/" className="inline-flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CampusConnect
          </span>
        </a>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 transition-all duration-500 hover:shadow-indigo-100/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to continue your learning journey</p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : focusedField === 'email'
                        ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <a href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500' 
                        : focusedField === 'password'
                        ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Create Account
                </a>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Your data is secure and encrypted</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

    