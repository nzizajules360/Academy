
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, Mail, ArrowRight, UserPlus, Loader2 } from "lucide-react"

export default function GrantRolePage() {
  const [email, setEmail] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleGrantRole = async () => {
    if (!email || !secretCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email and secret code are required",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/developer/manual-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to grant role');
      }
      
      toast({
        title: "Success",
        description: result.message,
      });

      router.push('/developer/auth/login');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleGrantRole();
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
       <div className="relative container min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md mx-auto">
                <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                    <CardHeader className="space-y-3 pb-8 text-center">
                         <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg mx-auto">
                            <UserPlus className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-white">
                            Grant Developer Role
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base">
                            Manually grant developer permissions to a registered user.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6" onKeyPress={handleKeyPress}>
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
                                placeholder="user@example.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="secret" className="text-sm font-medium text-slate-200 flex items-center space-x-2">
                                <Lock className="h-4 w-4 text-blue-400" />
                                <span>Admin Secret Code</span>
                            </Label>
                            <Input
                                id="secret"
                                type="password"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                required
                                placeholder="Enter the secret code"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 px-4"
                            />
                        </div>
                         <Button onClick={handleGrantRole} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <span className="flex items-center">Grant Role <ArrowRight className="ml-2 h-4 w-4"/></span>
                            )}
                        </Button>

                         <div className="pt-4 border-t border-white/10">
                            <p className="text-center text-sm text-slate-400">
                                After granting the role, the user can {' '}
                                <a href="/developer/auth/login" className="text-blue-400 hover:text-blue-300 font-medium underline">
                                login here
                                </a>.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
       </div>
    </div>
  )
}
