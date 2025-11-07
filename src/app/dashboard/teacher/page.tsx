'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Welcome! Here are your tools for managing your class.</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Attendance</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Take daily attendance for your assigned class.
            </CardDescription>
            <Link href="/dashboard/teacher/attendance" className="mt-4 inline-block">
                <Button>Take Attendance</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
