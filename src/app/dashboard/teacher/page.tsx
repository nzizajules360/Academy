
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, Send, ArrowRight, BookCheck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ActionCard = ({ title, description, icon: Icon, href, buttonText }: { title: string, description: string, icon: React.ElementType, href: string, buttonText: string }) => (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="h-full">
    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <CardDescription className="text-base">
              {description}
            </CardDescription>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href={href}>
                    {buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
    </Card>
    </motion.div>
)

export default function TeacherDashboard() {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
    >
       <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Welcome! Here are your tools for managing your class and students.
            </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
            title="Daily Attendance"
            description="Take daily attendance for your assigned class to keep records up-to-date."
            icon={ListChecks}
            href="/dashboard/teacher/attendance"
            buttonText="Take Attendance"
        />

        <ActionCard
            title="Attendance Reports"
            description="View historical attendance data for your class for any term or date range."
            icon={BookCheck}
            href="/dashboard/teacher/attendance/report"
            buttonText="View Reports"
        />

        <ActionCard
            title="Received Lists"
            description="View important lists of students sent to you by the school secretary."
            icon={Send}
            href="/dashboard/teacher/lists"
            buttonText="View Lists"
        />
      </div>
    </motion.div>
  );
}
