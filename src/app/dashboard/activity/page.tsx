'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityPage() {

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl overflow-hidden">
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                <History className="h-6 w-6 text-primary" />
                                My Activity
                            </CardTitle>
                            <CardDescription className="text-base mt-1">A log of all actions you have taken in the application.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">Activity Log Coming Soon</h3>
                        <p>This section will show a history of your actions, such as creating students or updating records.</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
