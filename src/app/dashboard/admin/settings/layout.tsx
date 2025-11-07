
'use client';
import { Button } from "@/components/ui/button";
import { Settings, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const settingsNav = [
        { href: '/dashboard/admin/settings/fees', label: 'Fee Settings', icon: DollarSign },
        { href: '/dashboard/admin/settings/academic', label: 'Academic Settings', icon: Calendar },
    ];
    
    return (
        <div className="grid md:grid-cols-[16rem_1fr] gap-12">
            <aside className="flex flex-col gap-8">
                 <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Application Settings
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Configure core aspects of the school management system.
                    </p>
                </div>
                 <nav className="flex flex-col gap-2">
                    {settingsNav.map(item => (
                        <Link href={item.href} key={item.href} passHref>
                           <Button 
                                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"} 
                                className="w-full justify-start h-12 text-base"
                            >
                                <item.icon className="mr-3 h-5 w-5"/>
                                {item.label}
                           </Button>
                        </Link>
                    ))}
                 </nav>
            </aside>
            <div className="">
                {children}
            </div>
        </div>
    )
}
