'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/firebase/auth"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeveloperLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate secret code first
      if (secretCode !== 'fabdevjulesdev') {
        throw new Error("Invalid developer secret code")
      }

      // Proceed with login if secret code is valid
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Force refresh the token to get latest claims
      await user.getIdToken(true)
      
      // Check if user has developer role in their claims
      const idTokenResult = await user.getIdTokenResult(true)
      
      if (!idTokenResult.claims.developer) {
        // Try to set developer claims if they don't exist
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

          // Refresh token again after setting claims
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

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Academy Developer Portal
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This portal provides advanced system management capabilities for Academy developers.
              Access is strictly limited to authorized development team members."
            </p>
            <footer className="text-sm">Development Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Developer Login</CardTitle>
              <CardDescription>
                Enter your credentials and developer secret code to access the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secret" className="text-sm font-medium">Developer Secret Code</Label>
                  <Input
                    id="secret"
                    type="password"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    required
                    placeholder="Enter developer secret code"
                    className="border-input bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="border-input bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="border-input bg-background"
                  />
                </div>
                <Button type="submit" className="w-full font-medium" disabled={loading}>
                  {loading ? "Authenticating..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Need a developer account?{" "}
            <a
              href="/developer/auth/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}