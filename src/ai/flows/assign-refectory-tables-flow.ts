'use server';

/**
 * @fileOverview Assigns students to refectory tables based on specific rules.
 *
 * - assignRefectoryTables - A function that handles the table assignment logic.
 * - AssignRefectoryTablesInput - The input type for the function.
 * - AssignRefectoryTablesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define input schema for a single student
const StudentSchema = z.object({
    id: z.string().describe('The unique identifier for the student.'),
    name: z.string().describe('The name of the student.'),
    gender: z.enum(['male', 'female']).describe('The gender of the student.'),
    class: z.string().describe('The class of the student.'),
});

// Define the overall input schema for the flow
const AssignRefectoryTablesInputSchema = z.object({
  students: z.array(StudentSchema).describe('A list of all students to be assigned.'),
});
export type AssignRefectoryTablesInput = z.infer<typeof AssignRefectoryTablesInputSchema>;


// Define output schema for a single student's assignment
const StudentAssignmentSchema = z.object({
    studentId: z.string().describe("The student's unique ID."),
    studentName: z.string().describe("The student's name."),
    morningTable: z.number().describe('The assigned table number for morning and lunch meals.'),
    eveningTable: z.number().describe('The assigned table number for the evening meal.'),
});

// Define the overall output schema for the flow
const AssignRefectoryTablesOutputSchema = z.array(StudentAssignmentSchema);
export type AssignRefectoryTablesOutput = z.infer<typeof AssignRefectoryTablesOutputSchema>;


// Define table structure and capacities
const TABLE_CAPACITY = { boys: 3, girls: 7 };
const SERIES_CONFIG = {
    morning: { first: 28, second: 11 },
    evening: { first: 28, second: 8 },
};

function initializeTables(meal: 'morning' | 'evening') {
    const totalTables = SERIES_CONFIG[meal].first + SERIES_CONFIG[meal].second;
    return Array.from({ length: totalTables }, () => ({
        boys: 0,
        girls: 0,
    }));
}


// Exported wrapper function to be called from the frontend
export async function assignRefectoryTables(input: AssignRefectoryTablesInput): Promise<AssignRefectoryTablesOutput> {
  return assignRefectoryTablesFlow(input);
}


const assignRefectoryTablesFlow = ai.defineFlow(
  {
    name: 'assignRefectoryTablesFlow',
    inputSchema: AssignRefectoryTablesInputSchema,
    outputSchema: AssignRefectoryTablesOutputSchema,
  },
  async ({ students }) => {
    
    // This is a deterministic logic flow, not an LLM prompt.
    // We wrap it in a Genkit flow to keep server-side logic organized.

    const studentAssignments: { [studentId: string]: { studentId: string, studentName: string, morningTable: number, eveningTable: number } } = {};

    // Initialize assignments
    students.forEach(student => {
        studentAssignments[student.id] = { 
            studentId: student.id, 
            studentName: student.name,
            morningTable: 0, 
            eveningTable: 0 
        };
    });

    // Process assignments for each meal time independently
    for (const meal of ['morning', 'evening'] as const) {
        const tables = initializeTables(meal);
        const studentsToAssign = [...students].sort(() => Math.random() - 0.5); // Shuffle for better distribution

        for (const student of studentsToAssign) {
            let assigned = false;
            for (let i = 0; i < tables.length; i++) {
                const capacity = student.gender === 'male' ? TABLE_CAPACITY.boys : TABLE_CAPACITY.girls;
                const currentCount = student.gender === 'male' ? tables[i].boys : tables[i].girls;

                if (currentCount < capacity) {
                    if (student.gender === 'male') {
                        tables[i].boys++;
                    } else {
                        tables[i].girls++;
                    }

                    if (meal === 'morning') {
                        studentAssignments[student.id].morningTable = i + 1;
                    } else {
                        studentAssignments[student.id].eveningTable = i + 1;
                    }
                    assigned = true;
                    break;
                }
            }
        }
    }
    
    return Object.values(studentAssignments);
  }
);
