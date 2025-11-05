'use server';

/**
 * @fileOverview Generates a daily to-do list for admins, patrons, or matrons based on their responsibilities and current school activities.
 *
 * - generateDailyTodoList - A function that generates a daily to-do list.
 * - GenerateDailyTodoListInput - The input type for the generateDailyTodoList function.
 * - GenerateDailyTodoListOutput - The return type for the generateDailyTodoList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyTodoListInputSchema = z.object({
  role: z.enum(['admin', 'patron', 'matron']).describe('The role of the user.'),
  responsibilities: z.string().describe('A description of the user\'s responsibilities.'),
  currentActivities: z.string().describe('A description of the current school activities.'),
});
export type GenerateDailyTodoListInput = z.infer<typeof GenerateDailyTodoListInputSchema>;

const GenerateDailyTodoListOutputSchema = z.object({
  todoList: z.string().describe('A list of tasks for the day'),
});
export type GenerateDailyTodoListOutput = z.infer<typeof GenerateDailyTodoListOutputSchema>;

export async function generateDailyTodoList(input: GenerateDailyTodoListInput): Promise<GenerateDailyTodoListOutput> {
  return generateDailyTodoListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyTodoListPrompt',
  input: {schema: GenerateDailyTodoListInputSchema},
  output: {schema: GenerateDailyTodoListOutputSchema},
  prompt: `You are an AI assistant helping school staff to generate daily to-do lists.

You will receive the staff member's role, responsibilities, and the current school activities.
Based on this information, generate a comprehensive to-do list for the day.

Role: {{{role}}}
Responsibilities: {{{responsibilities}}}
Current Activities: {{{currentActivities}}}

To-Do List:
`,
});

const generateDailyTodoListFlow = ai.defineFlow(
  {
    name: 'generateDailyTodoListFlow',
    inputSchema: GenerateDailyTodoListInputSchema,
    outputSchema: GenerateDailyTodoListOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
