'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { generateDailyTodoList } from '@/ai/flows/generate-daily-todo-list';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  responsibilities: z.string().min(10, {
    message: 'Responsibilities must be at least 10 characters.',
  }),
  currentActivities: z.string().min(10, {
    message: 'Current activities must be at least 10 characters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function DailyPlannerForm() {
  const [todoList, setTodoList] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      responsibilities: '',
      currentActivities: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setTodoList(null);
    try {
      const result = await generateDailyTodoList({
        role: 'matron',
        ...data,
      });
      setTodoList(result.todoList);
    } catch (e) {
      setError('Failed to generate to-do list. Please try again.');
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Your Daily To-Do List</CardTitle>
          <CardDescription>
            Describe your core duties and current school events, and our AI assistant will create a tailored to-do list for your day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Responsibilities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`e.g., "Manage girls in the dormitory, ensure their well-being, check their utilities, and supervise prep time."`}
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentActivities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current School Activities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`e.g., "Mid-term examinations are ongoing. Annual sports day preparations have started. A parents-teachers meeting is scheduled for this weekend."`}
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate List
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Your AI-Generated Tasks</CardTitle>
          <CardDescription>Here is your personalized plan for the day.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {todoList && (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4">
              {todoList}
            </div>
          )}
          {!isLoading && !todoList && !error && (
             <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4 rounded-lg border-2 border-dashed">
                <p>Your to-do list will appear here once generated.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
