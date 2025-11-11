
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeesForm } from '../settings/fees/fees-form';
import { AcademicSettings } from './academic-settings';
import { DollarSign, Calendar } from 'lucide-react';

export default function SecretarySettingsPage() {
    return (
         <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Application Settings
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Configure fees and academic calendars for the school.
                </p>
            </div>
            <Tabs defaultValue="fees" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fees" className="py-2">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Fee Settings
                    </TabsTrigger>
                    <TabsTrigger value="academic" className="py-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        Academic Settings
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="fees" className="mt-6">
                    <FeesForm />
                </TabsContent>
                <TabsContent value="academic" className="mt-6">
                    <AcademicSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
