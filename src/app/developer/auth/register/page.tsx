'use client''use client''use client'



import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Input } from "@/components/ui/input"import { Button } from "@/components/ui/button"import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"

import { useToast } from "@/hooks/use-toast"import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { auth } from "@/firebase/auth"

import { createUserWithEmailAndPassword } from "firebase/auth"import { Input } from "@/components/ui/input"import { Input } from "@/components/ui/input"

import { useState } from "react"

import { useRouter } from "next/navigation"import { Label } from "@/components/ui/label"import { Label } from "@/components/ui/label"

import { FirebaseError } from "firebase/app"

import Link from "next/link"import { useToast } from "@/hooks/use-toast"import { useToast } from "@/hooks/use-toast"



export default function DeveloperRegister() {import { auth } from "@/firebase/auth"import { auth } from "@/firebase/auth"

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")import { createUserWithEmailAndPassword } from "firebase/auth"import { createUserWithEmailAndPassword } from "firebase/auth"

  const [loading, setLoading] = useState(false)

  const { toast } = useToast()import { useState } from "react"import { useState } from "react"

  const router = useRouter()

import { useRouter } from "next/navigation"import { useRouter } from "next/navigation"

  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault()import { FirebaseError } from "firebase/app"import Link from "next/link"

    setLoading(true)

import Link from "next/link"import { getFirestore, doc, setDoc } from "firebase/firestore"

    try {

      // Create user accountimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"import type { Developer } from "@/types/developer"

      await createUserWithEmailAndPassword(auth, email, password)

import { FirebaseError } from "firebase/app"

      toast({

        title: "Success",// Define available roles and their descriptions

        description: "Account created successfully! You can now login.",

      })const DEVELOPER_ROLES = {export default function DeveloperRegister() {



      router.push('/developer/auth')  'junior-developer': {  const [email, setEmail] = useState("")

    } catch (error) {

      const fbError = error as FirebaseError    label: 'Junior Developer',  const [password, setPassword] = useState("")

      toast({

        variant: "destructive",    permissions: {  const [secretCode, setSecretCode] = useState("")

        title: "Error",

        description: fbError.message || "Failed to create account",      canViewLogs: true,  const [adminCode, setAdminCode] = useState("")  // Special code only known to admin developers

      })

    } finally {      canDeploySystem: false,  const [loading, setLoading] = useState(false)

      setLoading(false)

    }      canManageUsers: false,  const { toast } = useToast()

  }

      canManageSettings: false,  const router = useRouter()

  return (

    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">    }

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">

        <div className="absolute inset-0 bg-zinc-900" />  },  const handleRegister = async (e: React.FormEvent) => {

        <div className="relative z-20 flex items-center text-lg font-medium">

          <svg  'senior-developer': {    e.preventDefault()

            xmlns="http://www.w3.org/2000/svg"

            viewBox="0 0 24 24"    label: 'Senior Developer',    setLoading(true)

            fill="none"

            stroke="currentColor"    permissions: {

            strokeWidth="2"

            strokeLinecap="round"      canViewLogs: true,    try {

            strokeLinejoin="round"

            className="mr-2 h-6 w-6"      canDeploySystem: true,      // Validate secret code

          >

            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />      canManageUsers: false,      if (secretCode !== 'fabdevjulesdev') {

          </svg>

          Academy Developer Portal      canManageSettings: true,        throw new Error("Invalid developer secret code")

        </div>

        <div className="relative z-20 mt-auto">    }      }

          <blockquote className="space-y-2">

            <p className="text-lg">  },      // For admin code, we'll use the same code for simplicity

              "Join our development team to contribute to the Academy system."

            </p>  'admin-developer': {      if (adminCode !== 'fabdevjulesdev') {

            <footer className="text-sm">Development Team</footer>

          </blockquote>    label: 'Admin Developer',        throw new Error("Invalid admin authorization code")

        </div>

      </div>    permissions: {      }

      <div className="lg:p-8">

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">      canViewLogs: true,

          <Card className="border-0 shadow-none">

            <CardHeader>      canDeploySystem: true,      // Create the user account

              <CardTitle className="text-2xl font-bold tracking-tight">Developer Registration</CardTitle>

              <CardDescription>      canManageUsers: true,      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

                Create your developer account to get started.

              </CardDescription>      canManageSettings: true,      const user = userCredential.user

            </CardHeader>

            <CardContent>    }

              <form onSubmit={handleRegister} className="space-y-4">

                <div className="space-y-2">  }      // Create developer document in Firestore

                  <Label htmlFor="email">Email</Label>

                  <Input} as const;      const db = getFirestore()

                    id="email"

                    type="email"      const developerData: Developer = {

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}type DeveloperRole = keyof typeof DEVELOPER_ROLES;        uid: user.uid,

                    required

                    placeholder="Enter your email"        email: user.email!,

                  />

                </div>export default function DeveloperRegister() {        role: 'developer',

                <div className="space-y-2">

                  <Label htmlFor="password">Password</Label>  const [email, setEmail] = useState("")        status: 'approved',

                  <Input

                    id="password"  const [password, setPassword] = useState("")        createdAt: new Date().toISOString(),

                    type="password"

                    value={password}  const [secretCode, setSecretCode] = useState("")        permissions: {

                    onChange={(e) => setPassword(e.target.value)}

                    required  const [role, setRole] = useState<DeveloperRole>('junior-developer')          canManageUsers: false,

                    placeholder="Enter your password"

                  />  const [loading, setLoading] = useState(false)          canManageSettings: false,

                </div>

                <Button type="submit" className="w-full" disabled={loading}>  const { toast } = useToast()          canViewLogs: true,

                  {loading ? "Creating Account..." : "Create Account"}

                </Button>  const router = useRouter()          canDeploySystem: false

                <div className="text-center text-sm text-muted-foreground">

                  Already have an account?{" "}        },

                  <Link

                    href="/developer/auth"  const handleRegister = async (e: React.FormEvent) => {        settings: {

                    className="underline underline-offset-4 hover:text-primary"

                  >    e.preventDefault()          notificationsEnabled: true,

                    Sign in

                  </Link>    setLoading(true)          theme: 'system',

                </div>

              </form>          timezone: 'UTC'

            </CardContent>

          </Card>    try {        },

        </div>

      </div>      // Validate secret code        profile: {}

    </div>

  )      if (secretCode !== 'fabdevjulesdev') {      }

}
        throw new Error("Invalid developer secret code")

      }      // Store in developers collection

      await setDoc(doc(db, 'developers', user.uid), developerData)

      // Create user account

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)      // Set custom claims via API

      const user = userCredential.user      const claimsResponse = await fetch('/api/developer/set-claims', {

        method: 'POST',

      // Set claims via API        headers: {

      const claimsResponse = await fetch('/api/developer/set-claims', {          'Content-Type': 'application/json',

        method: 'POST',        },

        headers: {        body: JSON.stringify({ uid: user.uid }),

          'Content-Type': 'application/json',      })

        },

        body: JSON.stringify({       if (!claimsResponse.ok) {

          uid: user.uid,        throw new Error('Failed to set developer permissions')

          role,      }

          permissions: DEVELOPER_ROLES[role].permissions

        }),      toast({

      })        title: "Success",

        description: "Developer account created successfully. You can now log in.",

      if (!claimsResponse.ok) {      })

        throw new Error("Failed to set developer permissions")

      }      router.push("/developer/auth/login")

    } catch (error) {

      toast({      const fbError = error as FirebaseError

        title: "Success",      toast({

        description: "Developer account created successfully! You can now login.",        variant: "destructive",

      })        title: "Error",

        description: fbError.message || "Failed to create account",

      router.push('/developer/auth')      })

    } catch (error) {    } finally {

      const fbError = error as FirebaseError      setLoading(false)

      toast({    }

        variant: "destructive",  }

        title: "Error",

        description: fbError.message || "Failed to create account",  return (

      })    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">

    } finally {      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">

      setLoading(false)        <div className="absolute inset-0 bg-zinc-900" />

    }        <div className="relative z-20 flex items-center text-lg font-medium">

  }          <svg

            xmlns="http://www.w3.org/2000/svg"

  return (            viewBox="0 0 24 24"

    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">            fill="none"

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">            stroke="currentColor"

        <div className="absolute inset-0 bg-zinc-900" />            strokeWidth="2"

        <div className="relative z-20 flex items-center text-lg font-medium">            strokeLinecap="round"

          <svg            strokeLinejoin="round"

            xmlns="http://www.w3.org/2000/svg"            className="mr-2 h-6 w-6"

            viewBox="0 0 24 24"          >

            fill="none"            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />

            stroke="currentColor"          </svg>

            strokeWidth="2"          Academy Developer Portal

            strokeLinecap="round"        </div>

            strokeLinejoin="round"        <div className="relative z-20 mt-auto">

            className="mr-2 h-6 w-6"          <blockquote className="space-y-2">

          >            <p className="text-lg">

            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />              "Join our development team to contribute to the Academy system.

          </svg>              Developer registration is strictly controlled for security purposes."

          Academy Developer Portal            </p>

        </div>            <footer className="text-sm">Development Team</footer>

        <div className="relative z-20 mt-auto">          </blockquote>

          <blockquote className="space-y-2">        </div>

            <p className="text-lg">      </div>

              "Join our development team to contribute to the Academy system.      <div className="lg:p-8">

              Select your role to get the appropriate access level."        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">

            </p>          <Card className="border-0 shadow-none">

            <footer className="text-sm">Development Team</footer>            <CardHeader className="space-y-1">

          </blockquote>              <CardTitle className="text-2xl font-bold tracking-tight">Developer Registration</CardTitle>

        </div>              <CardDescription>

      </div>                Create a new developer account with special authorization codes.

      <div className="lg:p-8">              </CardDescription>

        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">            </CardHeader>

          <Card className="border-0 shadow-none">            <CardContent>

            <CardHeader>              <form onSubmit={handleRegister} className="space-y-4">

              <CardTitle className="text-2xl font-bold tracking-tight">Developer Registration</CardTitle>                <div className="space-y-2">

              <CardDescription>                  <Label htmlFor="secret" className="text-sm font-medium">Developer Secret Code</Label>

                Create a new developer account with your preferred access level.                  <Input

              </CardDescription>                    id="secret"

            </CardHeader>                    type="password"

            <CardContent>                    value={secretCode}

              <form onSubmit={handleRegister} className="space-y-4">                    onChange={(e) => setSecretCode(e.target.value)}

                <div className="space-y-2">                    required

                  <Label htmlFor="role">Developer Role</Label>                    placeholder="Enter developer secret code"

                  <Select value={role} onValueChange={(value: DeveloperRole) => setRole(value)}>                    className="border-input bg-background"

                    <SelectTrigger>                  />

                      <SelectValue placeholder="Select your role" />                </div>

                    </SelectTrigger>                <div className="space-y-2">

                    <SelectContent>                  <Label htmlFor="adminCode" className="text-sm font-medium">Admin Authorization Code</Label>

                      {Object.entries(DEVELOPER_ROLES).map(([key, value]) => (                  <Input

                        <SelectItem key={key} value={key}>                    id="adminCode"

                          {value.label}                    type="password"

                        </SelectItem>                    value={adminCode}

                      ))}                    onChange={(e) => setAdminCode(e.target.value)}

                    </SelectContent>                    required

                  </Select>                    placeholder="Enter admin authorization code"

                  <p className="text-sm text-muted-foreground">                    className="border-input bg-background"

                    {role && DEVELOPER_ROLES[role].label} has access to:{" "}                  />

                    {Object.entries(DEVELOPER_ROLES[role].permissions)                </div>

                      .filter(([_, value]) => value)                <div className="space-y-2">

                      .map(([key]) => key.replace('can', '').replace(/([A-Z])/g, ' $1').toLowerCase())                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>

                      .join(', ')}                  <Input

                  </p>                    id="email"

                </div>                    type="email"

                <div className="space-y-2">                    value={email}

                  <Label htmlFor="secret">Developer Secret Code</Label>                    onChange={(e) => setEmail(e.target.value)}

                  <Input                    required

                    id="secret"                    placeholder="Enter your email"

                    type="password"                    className="border-input bg-background"

                    value={secretCode}                  />

                    onChange={(e) => setSecretCode(e.target.value)}                </div>

                    required                <div className="space-y-2">

                    placeholder="Enter developer secret code"                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>

                  />                  <Input

                </div>                    id="password"

                <div className="space-y-2">                    type="password"

                  <Label htmlFor="email">Email</Label>                    value={password}

                  <Input                    onChange={(e) => setPassword(e.target.value)}

                    id="email"                    required

                    type="email"                    placeholder="Enter your password"

                    value={email}                    className="border-input bg-background"

                    onChange={(e) => setEmail(e.target.value)}                  />

                    required                </div>

                    placeholder="Enter your email"                <Button type="submit" className="w-full font-medium" disabled={loading}>

                  />                  {loading ? "Creating Account..." : "Register Developer Account"}

                </div>                </Button>

                <div className="space-y-2">              </form>

                  <Label htmlFor="password">Password</Label>            </CardContent>

                  <Input          </Card>

                    id="password"          <p className="px-8 text-center text-sm text-muted-foreground">

                    type="password"            Already have an account?{" "}

                    value={password}            <a

                    onChange={(e) => setPassword(e.target.value)}              href="/developer/auth/login"

                    required              className="underline underline-offset-4 hover:text-primary"

                    placeholder="Enter your password"            >

                  />              Sign in here

                </div>            </a>

                <Button type="submit" className="w-full" disabled={loading}>          </p>

                  {loading ? "Creating Account..." : "Register Developer Account"}        </div>

                </Button>      </div>

                <div className="text-center text-sm text-muted-foreground">    </div>

                  Already have an account?{" "}  )

                  <Link}

                    href="/developer/auth"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}