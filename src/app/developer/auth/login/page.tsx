"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/firebase/auth"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"
import { Shield, Lock, Code2, ArrowRight, AlertCircle } from "lucide-react"
import type { Developer } from "@/types/developer"

export default function DeveloperLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async () => {
    if (!secretCode || !email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required",
      })
      return
    }

    setLoading(true)

    try {
      if (secretCode !== 'fabdevjulesdev') {
        throw new Error("Invalid developer secret code")
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const db = getFirestore()
      const developerDoc = await getDoc(doc(db, 'developers', user.uid))
      
      if (!developerDoc.exists()) {
        await auth.signOut()
        throw new Error("Developer account not found.")
      }

      const developerData = developerDoc.data() as Developer
      
      if (developerData.status === 'rejected') {
        await auth.signOut()
        throw new Error("Your developer account has been rejected.")
      }

      if (developerData.status === 'pending') {
        await auth.signOut()
        throw new Error("Your developer account is pending approval.")
      }

      await updateDoc(doc(db, 'developers', user.uid), {
        lastLogin: new Date().toISOString()
      })

      await user.getIdToken(true)
      const idTokenResult = await user.getIdTokenResult(true)
      
      if (!idTokenResult.claims.developer) {
        try {
          const response = await fetch('/api/developer/set-claims', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: user.uid }),
          });

          if (!response.ok) {
            await auth.signOut()
            throw new Error("Failed to set developer role. Please contact administrator.")
          }

          await user.getIdToken(true)
        } catch (error) {
          await auth.signOut()
          throw new Error("Unauthorized access. Developer role required.")
        }
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      router.push("/developer/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to login",
      })
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="relative container min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col space-y-8 text-white">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium">Secure Developer Access</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Academy Developer Portal
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                Advanced system management capabilities for authorized development team members.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-start space-x-4 group">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <Code2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Full System Access</h3>
                  <p className="text-sm text-slate-400">Manage applications, users, and configurations</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Enterprise Security</h3>
                  <p className="text-sm text-slate-400">Multi-factor authentication and role-based access</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                  <Shield className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Audit & Compliance</h3>
                  <p className="text-sm text-slate-400">Complete activity logging and monitoring</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <blockquote className="text-sm text-slate-400 italic">
                "Restricted access portal. All activities are monitored and logged for security purposes."
              </blockquote>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader className="space-y-3 pb-8">
                <div className="flex items-center space-x-2 text-blue-400 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Developer Authentication</span>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-white">
                  Sign In
                </CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Enter your credentials to access the developer portal
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-5" onKeyPress={handleKeyPress}>
                  {/* Secret Code */}
                  <div className="space-y-2">
                    <Label htmlFor="secret" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-blue-400" />
                      <span>Developer Secret Code</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="secret"
                        type="password"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        onFocus={() => setFocusedField("secret")}
                        onBlur={() => setFocusedField("")}
                        required
                        placeholder="Enter secret code"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 transition-all duration-200 ${
                          focusedField === "secret" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "hover:border-white/20"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
                        required
                        placeholder="developer@academy.com"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 transition-all duration-200 ${
                          focusedField === "email" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "hover:border-white/20"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                        required
                        placeholder="Enter your password"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 transition-all duration-200 ${
                          focusedField === "password" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "hover:border-white/20"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This is a restricted access system. Unauthorized access attempts are logged and may result in legal action.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleLogin}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Sign In to Portal</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>

                {/* Register Link */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-center text-sm text-slate-400">
                    Need developer access?{" "}
                    <a
                      href="/developer/auth/register"
                      className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4 transition-colors"
                    >
                      Request an account
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mobile branding */}
            <div className="lg:hidden mt-8 text-center">
              <div className="inline-flex items-center space-x-2 text-slate-400 text-sm">
                <Shield className="h-4 w-4" />
                <span>Secure Developer Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}