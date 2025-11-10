
'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Loader2, Construction } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaintenanceNotice() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const settingsRef = firestore ? doc(firestore, 'settings', 'system') : null;
  const [settings, loadingSettings] = useDocumentData(settingsRef);

  const isDeveloper = user?.role === 'developer';
  const isAdmin = user?.role === 'admin';
  const canBypass = isDeveloper || isAdmin;

  const inMaintenance = settings?.maintenanceMode === true;

  if (userLoading || loadingSettings || !inMaintenance || canBypass) {
    return null;
  }

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
            <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 border-2 border-orange-500/20 flex items-center justify-center">
                <Construction className="w-8 h-8 text-orange-500" />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-orange-500">System Maintenance</h1>
                <p className="text-muted-foreground text-base">
                    The application is currently undergoing scheduled maintenance. We apologize for any inconvenience.
                </p>
                 <p className="text-muted-foreground text-sm">
                    Please check back again shortly.
                </p>
            </div>
        </motion.div>
    </motion.div>
  )
}
