
'use client'

import { DashboardHeader } from "@/components/dashboard/header"
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader as DevSidebarHeader, SidebarContent } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { auth } from "@/firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { ShieldCheck, LayoutDashboard, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
    { href: "/developer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/developer/settings", icon: Settings, label: "Settings" }
]

export default function DeveloperDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/developer/auth/login')
        return
      }

      // Verify developer role
      try {
        const idTokenResult = await user.getIdTokenResult(true) // Force refresh
        if (!idTokenResult.claims.developer) {
          throw new Error("Access Denied: Developer role required.")
        }
      } catch (error: any) {
         await auth.signOut()
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: error.message || "You need developer permissions to access this area.",
          })
          router.push('/developer/auth/login')
      }
    })

    return () => unsubscribe()
  }, [router, toast])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible="icon" className="hidden sm:block">
            <DevSidebarHeader>
                 <div className="flex items-center gap-2" data-sidebar-menu-button="">
                    <ShieldCheck className="h-7 w-7 text-sidebar-primary-foreground" />
                    <span className="text-lg font-semibold text-sidebar-foreground">Developer</span>
                </div>
            </DevSidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map(item => (
                        <SidebarMenuItem key={item.href}>
                             <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:px-6 sm:py-4">
             <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
