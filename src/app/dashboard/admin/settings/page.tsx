
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeesForm } from '@/app/dashboard/admin/settings/fees/fees-form';
import { AcademicSettings } from '@/app/dashboard/secretary/settings/academic-settings';
import TeacherAssignmentsPage from './assignments/page';
import { MaterialsSettings } from './materials-settings';
import { DormitorySettings } from './dormitory-settings';
import { DollarSign, Calendar, Book, BedDouble, Wrench } from 'lucide-react';

export default function AdminSettingsPage() {
  const tabs = [
    { value: 'fees', label: 'Fee Structure', icon: DollarSign, component: <FeesForm /> },
    { value: 'academic', label: 'Academic Year', icon: Calendar, component: <AcademicSettings /> },
    { value: 'assignments', label: 'Teacher Assignments', icon: Book, component: <TeacherAssignmentsPage /> },
    { value: 'materials', label: 'School Materials', icon: Wrench, component: <MaterialsSettings /> },
    { value: 'dormitory', label: 'Dormitory Config', icon: BedDouble, component: <DormitorySettings /> },
  ];

  return (
    <div className="space-y-8">
        <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Application Settings
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
                Configure core aspects of the school management system.
            </p>
        </div>

        <Tabs defaultValue="fees" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="py-3 px-2 text-sm">
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-6">
                    {tab.component}
                </TabsContent>
            ))}
        </Tabs>
    </div>
  );
}
