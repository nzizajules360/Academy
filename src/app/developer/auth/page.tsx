'use client''use client'



import { Button } from "@/components/ui/button"import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Input } from "@/components/ui/input"import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"import { Label } from "@/components/ui/label"

import { useToast } from "@/hooks/use-toast"import { useToast } from "@/hooks/use-toast"

import { auth } from "@/firebase/auth"import { auth } from "@/firebase/auth"

import { signInWithEmailAndPassword } from "firebase/auth"import { signInWithEmailAndPassword } from "firebase/auth"

import { useState } from "react"import { useState } from "react"

import { useRouter } from "next/navigation"import { useRouter } from "next/navigation"

import { FirebaseError } from "firebase/app"import { FirebaseError } from "firebase/app"

import Link from "next/link"import Link from "next/link"



export default function DeveloperAuth() {export default function DeveloperAuth() {

  const [email, setEmail] = useState("")  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)  const [secretCode, setSecretCode] = useState("")

  const { toast } = useToast()  const [loading, setLoading] = useState(false)

  const router = useRouter()  const { toast } = useToast()

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault()  const handleLogin = async (e: React.FormEvent) => {

    setLoading(true)    e.preventDefault()

    setLoading(true)

    try {

      await signInWithEmailAndPassword(auth, email, password)    try {

            // Validate secret code

      toast({      if (secretCode !== 'fabdevjulesdev') {

        title: "Success",        throw new Error("Invalid developer secret code")

        description: "Successfully logged in",      }

      })

      await signInWithEmailAndPassword(auth, email, password)

      router.push("/developer/dashboard")      

    } catch (error) {      toast({

      const fbError = error as FirebaseError        title: "Success",

      toast({        description: "Logged in successfully",

        variant: "destructive",      })

        title: "Error",

        description: fbError.message || "Failed to log in",      router.push("/developer/dashboard")

      })    } catch (error: any) {

    } finally {      toast({

      setLoading(false)        variant: "destructive",

    }        title: "Error",

  }        description: error.message || "Failed to login",

      })

  return (    } finally {

    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">      setLoading(false)

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">    }

        <div className="absolute inset-0 bg-zinc-900" />  }

        <div className="relative z-20 flex items-center text-lg font-medium">

          <svg  const handleRegister = async (e: React.FormEvent) => {

            xmlns="http://www.w3.org/2000/svg"    e.preventDefault()

            viewBox="0 0 24 24"    setLoading(true)

            fill="none"

            stroke="currentColor"    try {

            strokeWidth="2"      // Validate secret codes

            strokeLinecap="round"      if (secretCode !== 'fabdevjulesdev') {

            strokeLinejoin="round"        throw new Error("Invalid developer secret code")

            className="mr-2 h-6 w-6"      }

          >      if (adminCode !== 'fabdevjulesdev') {

            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />        throw new Error("Invalid admin authorization code")

          </svg>      }

          Academy Developer Portal

        </div>      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        <div className="relative z-20 mt-auto">      const user = userCredential.user

          <blockquote className="space-y-2">

            <p className="text-lg">      // Set developer claims

              "Welcome to the Academy Developer Portal. Sign in to access the development environment."      const response = await fetch('/api/developer/set-claims', {

            </p>        method: 'POST',

            <footer className="text-sm">Development Team</footer>        headers: {

          </blockquote>          'Content-Type': 'application/json',

        </div>        },

      </div>        body: JSON.stringify({ uid: user.uid }),

      <div className="lg:p-8">      });

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">

          <Card className="border-0 shadow-none">      if (!response.ok) {

            <CardHeader>        throw new Error('Failed to set developer role')

              <CardTitle className="text-2xl font-bold tracking-tight">Developer Login</CardTitle>      }

              <CardDescription>

                Enter your credentials to access the system.      // Force token refresh to get the new claims

              </CardDescription>      await user.getIdToken(true)

            </CardHeader>

            <CardContent>      toast({

              <form onSubmit={handleLogin} className="space-y-4">        title: "Success",

                <div className="space-y-2">        description: "Developer account created successfully! You can now login.",

                  <Label htmlFor="email">Email</Label>      })

                  <Input

                    id="email"      router.push("/developer/auth?tab=login")

                    type="email"    } catch (error) {

                    value={email}      const fbError = error as FirebaseError

                    onChange={(e) => setEmail(e.target.value)}      toast({

                    required        variant: "destructive",

                    placeholder="Enter your email"        title: "Error",

                  />        description: fbError.message || "Failed to create account",

                </div>      })

                <div className="space-y-2">    } finally {

                  <Label htmlFor="password">Password</Label>      setLoading(false)

                  <Input    }

                    id="password"  }

                    type="password"

                    value={password}  return (

                    onChange={(e) => setPassword(e.target.value)}    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">

                    required      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">

                    placeholder="Enter your password"        <div className="absolute inset-0 bg-zinc-900" />

                  />        <div className="relative z-20 flex items-center text-lg font-medium">

                </div>          <svg

                <Button type="submit" className="w-full" disabled={loading}>            xmlns="http://www.w3.org/2000/svg"

                  {loading ? "Signing in..." : "Sign In"}            viewBox="0 0 24 24"

                </Button>            fill="none"

                <div className="text-center text-sm text-muted-foreground">            stroke="currentColor"

                  Need an account?{" "}            strokeWidth="2"

                  <Link            strokeLinecap="round"

                    href="/developer/auth/register"            strokeLinejoin="round"

                    className="underline underline-offset-4 hover:text-primary"            className="mr-2 h-6 w-6"

                  >          >

                    Register here            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />

                  </Link>          </svg>

                </div>          Academy Developer Portal

              </form>        </div>

            </CardContent>        <div className="relative z-20 mt-auto">

          </Card>          <blockquote className="space-y-2">

        </div>            <p className="text-lg">

      </div>              "This portal provides advanced system management capabilities for Academy developers.

    </div>              Access is strictly limited to authorized development team members."

  )            </p>

}            <footer className="text-sm">Development Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
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
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link href="/developer/auth/register" className="underline underline-offset-4 hover:text-primary">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}