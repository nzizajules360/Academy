'use server';

/**
 * @fileOverview Generates a daily activity plan for a specific class of students.
 *
 * - generateClassActivityPlan - A function that generates morning and evening activities.
 * - GenerateClassActivityPlanInput - The input type for the function.
 * - GenerateClassActivityPlanOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateClassActivityPlanInputSchema = z.object({
  class: z.string().describe('The student class, e.g., "S1" or "L5 SWD".'),
  gender: z.enum(['male', 'female']).describe('The gender of the students in the class.'),
  focus: z.string().optional().describe('Any specific focus for the day, e.g., "prepare for exams" or "sports day practice".'),
});
export type GenerateClassActivityPlanInput = z.infer<typeof GenerateClassActivityPlanInputSchema>;

const GenerateClassActivityPlanOutputSchema = z.object({
  morningActivity: z.string().describe('A detailed activity for the morning session.'),
  eveningActivity: z.string().describe('A detailed activity for the evening session.'),
});
export type GenerateClassActivityPlanOutput = z.infer<typeof GenerateClassActivityPlanOutputSchema>;

export async function generateClassActivityPlan(input: GenerateClassActivityPlanInput): Promise<GenerateClassActivityPlanOutput> {
  return generateClassActivityPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClassActivityPlanPrompt',
  input: { schema: GenerateClassActivityPlanInputSchema },
  output: { schema: GenerateClassActivityPlanOutputSchema },
  prompt: `You are an expert in student development and activity planning for a boarding school in Rwanda. Your task is to create a balanced and engaging daily plan for a specific class.

Generate a morning activity and an evening activity for the following group:
- Class: {{{class}}}
- Gender: {{{gender}}}
{{#if focus}}
- Today's Focus: {{{focus}}}
{{/if}}

The activities should be appropriate for their age and gender. Consider activities that promote discipline, teamwork, academic excellence, and personal growth. The output must be in JSON format.

Example Activities:
- Morning: Dormitory cleaning and inspection, followed by a brief session on personal hygiene.
- Evening: Supervised group study session for upcoming exams, focusing on Mathematics and Physics.
- Morning: Campus grounds maintenance, focusing on the football pitch area.
- Evening: Debate practice on a current events topic.
`,
});

const generateClassActivityPlanFlow = ai.defineFlow(
  {
    name: 'generateClassActivityPlanFlow',
    inputSchema: GenerateClassActivityPlanInputSchema,
    outputSchema: GenerateClassActivityPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
