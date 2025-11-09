'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/firebase/auth"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import type { Developer } from "@/types/developer"
import { FirebaseError } from "firebase/app"

export default function DeveloperRegister() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secretCode, setSecretCode] = useState("")
  const [adminCode, setAdminCode] = useState("")  // Special code only known to admin developers
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate secret code
      if (secretCode !== 'fabdevjulesdev') {
        throw new Error("Invalid developer secret code")
      }
      // For admin code, we'll use the same code for simplicity
      if (adminCode !== 'fabdevjulesdev') {
        throw new Error("Invalid admin authorization code")
      }

      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create developer document in Firestore
      const db = getFirestore()
      const developerData: Developer = {
        uid: user.uid,
        email: user.email!,
        role: 'developer',
        status: 'pending',
        createdAt: new Date().toISOString(),
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewLogs: true,
          canDeploySystem: false
        },
        settings: {
          notificationsEnabled: true,
          theme: 'system',
          timezone: 'UTC'
        },
        profile: {}
      }

      // Store in developers collection
      await setDoc(doc(db, 'developers', user.uid), developerData)

      // Set custom claims via API
      const claimsResponse = await fetch('/api/developer/set-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid }),
      })

      if (!claimsResponse.ok) {
        throw new Error('Failed to set developer permissions')
      }

      toast({
        title: "Success",
        description: "Developer account created successfully. Please wait for admin approval.",
      })

      router.push("/developer/auth/login")
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
              "Join our development team to contribute to the Academy system.
              Developer registration is strictly controlled for security purposes."
            </p>
            <footer className="text-sm">Development Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <Card className="border-0 shadow-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Developer Registration</CardTitle>
              <CardDescription>
                Create a new developer account with special authorization codes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
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
                  <Label htmlFor="adminCode" className="text-sm font-medium">Admin Authorization Code</Label>
                  <Input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                    placeholder="Enter admin authorization code"
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
                  {loading ? "Creating Account..." : "Register Developer Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/developer/auth/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
