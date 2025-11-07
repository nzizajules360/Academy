'use client';
import { Button } from "@/components/ui/button";
import { Settings, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const settingsNav = [
        { href: '/dashboard/admin/settings/fees', label: 'Fee Settings', icon: Settings },
        { href: '/dashboard/admin/settings/academic', label: 'Academic Settings', icon: Calendar },
    ];
    
    return (
        <div className="grid md:grid-cols-[16rem_1fr] gap-8">
            <div>
                 <h2 className="text-xl font-bold mb-4">Settings</h2>
                 <div className="flex flex-col gap-2">
                    {settingsNav.map(item => (
                        <Link href={item.href} key={item.href} passHref>
                           <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
                                <item.icon className="mr-2 h-4 w-4"/>
                                {item.label}
                           </Button>
                        </Link>
                    ))}
                 </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}
