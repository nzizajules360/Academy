'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ActionCard = ({ title, description, icon: Icon, href, buttonText }: { title: string, description: string, icon: React.ElementType, href: string, buttonText: string }) => (
    <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-grow">
            <CardDescription>
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
)

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Welcome! Here are your tools for managing your class.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
            title="Class Attendance"
            description="Take daily attendance for your assigned class."
            icon={ListChecks}
            href="/dashboard/teacher/attendance"
            buttonText="Take Attendance"
        />

        <ActionCard
            title="Received Lists"
            description="View lists of students sent to you by the school secretary."
            icon={Send}
            href="/dashboard/teacher/lists"
            buttonText="View Lists"
        />
      </div>
    </div>
  );
}
