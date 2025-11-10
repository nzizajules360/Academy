import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/firebase/auth"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FirebaseError } from "firebase/app"
import Link from "next/link"
import { Shield, Code2, CheckCircle2, ArrowRight, AlertCircle, Mail, Lock, UserPlus } from "lucide-react"

export default function DeveloperRegister() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters",
      })
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      const response = await fetch('/api/developer/set-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: userCredential.user.uid
        })
      })

      if (!response.ok) {
        throw new Error('Failed to set developer permissions')
      }

      toast({
        title: "Success",
        description: "Account created successfully",
      })

      router.push("/developer/dashboard")
    } catch (error) {
      const fbError = error as FirebaseError
      toast({
        variant: "destructive",
        title: "Error",
        description: fbError.message || "Failed to create account",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleRegister()
    }
  }

  const passwordStrength = password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : password.length > 0 ? 'weak' : ''

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
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
                <UserPlus className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium">Developer Registration</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-white via-purple-100 to-blue-200 bg-clip-text text-transparent">
                Join Our Developer Community
              </h1>
              
              <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                Get access to powerful tools, comprehensive APIs, and resources to build amazing applications.
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-start space-x-4 group">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                  <Code2 className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Developer Tools</h3>
                  <p className="text-sm text-slate-400">Access to comprehensive SDKs and APIs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Instant Approval</h3>
                  <p className="text-sm text-slate-400">Get started immediately after registration</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                  <Shield className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Secure Access</h3>
                  <p className="text-sm text-slate-400">Enterprise-grade security and authentication</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">What you'll get:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">API Access</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">Documentation</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">Support</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Register form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader className="space-y-3 pb-8">
                <div className="flex items-center space-x-2 text-purple-400 mb-2">
                  <UserPlus className="h-5 w-5" />
                  <span className="text-sm font-medium">Create Account</span>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-white">
                  Get Started
                </CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Create your developer account in seconds
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-5" onKeyPress={handleKeyPress}>
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-purple-400" />
                      <span>Email Address</span>
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
                        placeholder="developer@example.com"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 transition-all duration-200 ${
                          focusedField === "email" ? "border-purple-500 shadow-lg shadow-purple-500/20" : "hover:border-white/20"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-purple-400" />
                      <span>Password</span>
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
                        placeholder="Minimum 6 characters"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 transition-all duration-200 ${
                          focusedField === "password" ? "border-purple-500 shadow-lg shadow-purple-500/20" : "hover:border-white/20"
                        }`}
                      />
                    </div>
                    {/* Password strength indicator */}
                    {password.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                              passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                              passwordStrength === 'strong' ? 'w-full bg-green-500' : 'w-0'
                            }`}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength === 'weak' ? 'text-red-400' :
                          passwordStrength === 'medium' ? 'text-yellow-400' :
                          passwordStrength === 'strong' ? 'text-green-400' : 'text-slate-500'
                        }`}>
                          {passwordStrength === 'weak' ? 'Weak' :
                           passwordStrength === 'medium' ? 'Medium' :
                           passwordStrength === 'strong' ? 'Strong' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-purple-400" />
                      <span>Confirm Password</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => setFocusedField("")}
                        required
                        placeholder="Re-enter your password"
                        className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 transition-all duration-200 ${
                          focusedField === "confirmPassword" ? "border-purple-500 shadow-lg shadow-purple-500/20" : "hover:border-white/20"
                        }`}
                      />
                    </div>
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <p className="text-xs text-red-400 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Passwords do not match</span>
                      </p>
                    )}
                  </div>

                  {/* Terms Notice */}
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <AlertCircle className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      By creating an account, you agree to our Terms of Service and Privacy Policy. Your account will be reviewed for approval.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleRegister}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>Create Developer Account</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </div>

                {/* Login Link */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link
                      href="/developer/auth"
                      className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mobile branding */}
            <div className="lg:hidden mt-8 text-center">
              <div className="inline-flex items-center space-x-2 text-slate-400 text-sm">
                <UserPlus className="h-4 w-4" />
                <span>Developer Registration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}