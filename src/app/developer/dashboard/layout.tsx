'use client'

import { UserNav } from "@/components/dashboard/user-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { auth } from "@/firebase/auth"
import { useToast } from "@/hooks/use-toast"

export default function DeveloperDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/developer/auth/login')
        return
      }

      // Verify developer role
      const idTokenResult = await user.getIdTokenResult()
      if (!idTokenResult.claims.developer) {
        await auth.signOut()
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You need developer permissions to access this area.",
        })
        router.push('/developer/auth/login')
      }
    })

    return () => unsubscribe()
  }, [router, toast])

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <Sidebar 
          className="w-64 border-r-2" 
          menu={[
            { href: '/dashboard/developer', icon: 'home', label: 'Dashboard' },
            { href: '/dashboard/developer/settings', icon: 'settings', label: 'Settings' }
          ]}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}