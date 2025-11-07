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
import type { EnrolledStudent, SeatingChart, RefectoryTable } from '@/types/refectory';

const TABLE_CAPACITY = {
    boys: 3,
    girls: 7,
};

const REFEFCTORY_CONFIG = {
  serie1: 28,
  serie2: { morning: 11, evening: 8 },
};

// Define input schema for a single student
const StudentSchema = z.object({
    id: z.string().describe('The unique identifier for the student.'),
    name: z.string().describe('The name of the student.'),
    gender: z.enum(['male', 'female']).describe('The gender of the student.'),
    class: z.string().describe('The class of the student.'),
});
export type AssignRefectoryTablesInput = z.infer<typeof AssignRefectoryTablesInputSchema>;

// Define the overall input schema for the flow
const AssignRefectoryTablesInputSchema = z.object({
  students: z.array(StudentSchema).describe('A list of all students to be assigned.'),
  previous: z.any().optional().describe('Previous seating chart to maintain some consistency.'),
});

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


function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function initializeTables(totalTables: number): RefectoryTable[] {
    const tables: RefectoryTable[] = [];
    for (let i = 1; i <= totalTables; i++) {
        tables.push({
            tableNumber: i,
            serie: i <= REFEFCTORY_CONFIG.serie1 ? 1 : 2,
            boys: [],
            girls: [],
        });
    }
    return tables;
}

function generateSeatingChart(students: EnrolledStudent[], previous?: SeatingChart): SeatingChart {
    const totalMorningTables = REFEFCTORY_CONFIG.serie1 + REFEFCTORY_CONFIG.serie2.morning;
    const totalEveningTables = REFEFCTORY_CONFIG.serie1 + REFEFCTORY_CONFIG.serie2.evening;

    const masterTables = initializeTables(totalMorningTables);
    const assignedIds = new Set<string>();

    if (previous && previous.morning) {
        for (const prevTable of previous.morning) {
            if (prevTable.tableNumber > masterTables.length) continue;
            const table = masterTables[prevTable.tableNumber - 1];
            const validBoys = prevTable.boys.filter(b => students.some(s => s.id === b.id));
            const validGirls = prevTable.girls.filter(g => students.some(s => s.id === g.id));

            table.boys = validBoys.slice(0, TABLE_CAPACITY.boys);
            table.girls = validGirls.slice(0, TABLE_CAPACITY.girls);

            table.boys.forEach(b => assignedIds.add(b.id));
            table.girls.forEach(g => assignedIds.add(g.id));
        }
    }

    let boys = shuffleArray(students.filter(s => s.gender === 'male' && !assignedIds.has(s.id)));
    let girls = shuffleArray(students.filter(s => s.gender === 'female' && !assignedIds.has(s.id)));

    let boyIndex = 0;
    let girlIndex = 0;

    for (const table of masterTables) {
        while (table.boys.length < TABLE_CAPACITY.boys && boyIndex < boys.length) {
            table.boys.push(boys[boyIndex]);
            boyIndex++;
        }
        while (table.girls.length < TABLE_CAPACITY.girls && girlIndex < girls.length) {
            table.girls.push(girls[girlIndex]);
            girlIndex++;
        }
    }

    const unassignedBoys = boys.length - boyIndex;
    const unassignedGirls = girls.length - girlIndex;

    if (unassignedBoys > 0) {
        console.warn(`${unassignedBoys} abahungu ntibabonye imyanya.`);
    }
    if (unassignedGirls > 0) {
        console.warn(`${unassignedGirls} abakobwa ntibabonye imyanya.`);
    }

    const morningShiftTables = masterTables;

    const eveningShiftTables = masterTables
        .map(table => ({ ...table, boys: [...table.boys], girls: [...table.girls] })) // Deep copy
        .filter(table => {
            if (table.serie === 1) return true;
            const serie2TableIndex = table.tableNumber - REFEFCTORY_CONFIG.serie1;
            return serie2TableIndex <= REFEFCTORY_CONFIG.serie2.evening;
        });

    return {
        morning: morningShiftTables,
        evening: eveningShiftTables,
    };
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
  async ({ students, previous }) => {
    
    const seatingChart = generateSeatingChart(students, previous);
    
    const assignments: Record<string, { studentId: string, studentName: string, morningTable: number, eveningTable: number }> = {};

    students.forEach(s => {
        assignments[s.id] = {
            studentId: s.id,
            studentName: s.name,
            morningTable: 0,
            eveningTable: 0,
        };
    });

    seatingChart.morning.forEach(table => {
        table.boys.forEach(student => {
            if (assignments[student.id]) {
                assignments[student.id].morningTable = table.tableNumber;
            }
        });
        table.girls.forEach(student => {
             if (assignments[student.id]) {
                assignments[student.id].morningTable = table.tableNumber;
            }
        });
    });

    seatingChart.evening.forEach(table => {
        table.boys.forEach(student => {
            if (assignments[student.id]) {
                assignments[student.id].eveningTable = table.tableNumber;
            }
        });
        table.girls.forEach(student => {
             if (assignments[student.id]) {
                assignments[student.id].eveningTable = table.tableNumber;
            }
        });
    });
    
    return Object.values(assignments);
  }
);
