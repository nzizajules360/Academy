"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, Mail, ArrowRight, UserPlus, Loader2, CheckCircle2, AlertCircle, Key } from "lucide-react"
import { useFirestore } from "@/firebase"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Secret code - in production, this should be in environment variables
const ADMIN_SECRET_CODE = process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE || "ADMIN_SECRET_2024"

export default function GrantRolePage() {
  const firestore = useFirestore()
  const [email, setEmail] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleGrantRole = async () => {
    if (!email || !secretCode) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Email and secret code are required",
      })
      return
    }

    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Firebase is not initialized",
      })
      return
    }

    // Validate secret code
    if (secretCode !== ADMIN_SECRET_CODE) {
      toast({
        variant: "destructive",
        title: "Invalid Secret Code",
        description: "The admin secret code you entered is incorrect",
      })
      return
    }

    setLoading(true)

    try {
      // Search for user by email
      const usersRef = collection(firestore, 'users')
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error('No user found with this email address. Please ensure the user is registered first.')
      }

      // Get the user document
      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data()

      // Check if user already has developer role
      if (userData.role === 'developer') {
        toast({
          title: "Already a Developer",
          description: `${userData.displayName || email} already has developer privileges.`,
        })
        setLoading(false)
        return
      }

      // Update user role to developer
      const userDocRef = doc(firestore, 'users', userDoc.id)
      await updateDoc(userDocRef, {
        role: 'developer',
        roleGrantedAt: new Date().toISOString(),
        roleGrantedBy: 'manual-grant',
      })

      setSuccess(true)
      toast({
        title: "Success!",
        description: `Developer role granted to ${userData.displayName || email}`,
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/developer/auth/login')
      }, 2000)
      
    } catch (error: any) {
      console.error('Grant role error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to grant developer role",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !success) {
      handleGrantRole()
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
       {/* Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
       
       {/* Animated Gradient Orbs */}
       <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
       <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
       
       <div className="relative container min-h-screen flex items-center justify-center px-4 py-8">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-md mx-auto"
                >
                  <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                      {/* Gradient Header Bar */}
                      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                      
                      <CardHeader className="space-y-4 pb-8 text-center pt-8">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-2 shadow-xl mx-auto relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-50"></div>
                            <UserPlus className="h-10 w-10 text-white relative z-10" />
                          </motion.div>
                          <CardTitle className="text-3xl font-bold tracking-tight text-white">
                              Grant Developer Role
                          </CardTitle>
                          <CardDescription className="text-slate-400 text-base leading-relaxed">
                              Manually grant developer permissions to a registered user account via Firebase.
                          </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-6 pb-8" onKeyPress={handleKeyPress}>
                          {/* Info Alert */}
                          <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-200">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <AlertDescription className="text-sm">
                              This action updates the user's role in Firestore. Ensure the user is registered before proceeding.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-2">
                              <Label htmlFor="email" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-blue-400" />
                                  <span>User's Email Address</span>
                              </Label>
                              <Input
                                  id="email"
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  required
                                  placeholder="developer@example.com"
                                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                  disabled={loading}
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                Enter the exact email address used during registration
                              </p>
                          </div>
                          
                          <div className="space-y-2">
                              <Label htmlFor="secret" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                                  <Key className="h-4 w-4 text-purple-400" />
                                  <span>Admin Secret Code</span>
                              </Label>
                              <Input
                                  id="secret"
                                  type="password"
                                  value={secretCode}
                                  onChange={(e) => setSecretCode(e.target.value)}
                                  required
                                  placeholder="••••••••••••••••"
                                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                  disabled={loading}
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                Contact system administrator for the secret code
                              </p>
                          </div>
                          
                          <Button 
                            onClick={handleGrantRole} 
                            className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                            disabled={loading}
                          >
                              {loading ? (
                                <span className="flex items-center">
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  Granting Role...
                                </span>
                              ) : (
                                  <span className="flex items-center">
                                    Grant Developer Role 
                                    <ArrowRight className="ml-2 h-4 w-4"/>
                                  </span>
                              )}
                          </Button>

                          <div className="pt-4 border-t border-white/10">
                              <p className="text-center text-sm text-slate-400">
                                  After granting the role, the user can {' '}
                                  <a href="/developer/auth/login" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 transition-colors">
                                  sign in here
                                  </a>
                              </p>
                          </div>

                          {/* How it Works */}
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-400" />
                              How This Works
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-400">
                              <li className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                <span>Searches for user by email in Firestore</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                <span>Validates admin secret code</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
                                <span>Updates user role to 'developer' in database</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                                <span>Grants immediate access to admin features</span>
                              </li>
                            </ul>
                          </div>
                      </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-md mx-auto"
                >
                  <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-center">
                    <CardContent className="py-12 space-y-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto shadow-xl relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-lg opacity-50"></div>
                        <CheckCircle2 className="h-12 w-12 text-white relative z-10" />
                      </motion.div>
                      
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Role Granted Successfully!</h2>
                        <p className="text-slate-400">
                          Developer permissions have been granted to {email}
                        </p>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-sm text-green-200">
                          Redirecting to login page...
                        </p>
                      </div>

                      <Button
                        onClick={() => router.push('/developer/auth/login')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                      >
                        Go to Login
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
       </div>
    </div>
  )
}