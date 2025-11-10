
"use client"

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, AlertOctagon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DeactivatedNotice() {
  const { user, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const [countdown, setCountdown] = useState(10);

  const isDisabled = !!(user as any)?.disabled
  const disabledMessage = (user as any)?.disabledMessage || 'Your account is no longer active.'
  
  useEffect(() => {
    if (!isDisabled) return;

    if (countdown <= 0) {
      if (auth) {
        signOut(auth).then(() => {
          router.push('/login');
        });
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isDisabled, auth, router]);

  if (loading || !isDisabled) return null

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border/50 text-center p-8 space-y-6"
        >
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center">
                <AlertOctagon className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-destructive">Account Disabled</h1>
                <p className="text-muted-foreground text-base">
                    {disabledMessage}
                </p>
                 <p className="text-muted-foreground text-sm">
                    Please contact an administrator if you believe this is an error.
                </p>
            </div>

            <div className="pt-4 space-y-4">
                 <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-destructive"
                        initial={{ width: '100%' }}
                        animate={{ width: `${countdown * 10}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    You will be logged out automatically in <span className="font-bold text-foreground">{countdown}</span> seconds.
                </p>
            </div>
        </motion.div>
    </motion.div>
  )
}
