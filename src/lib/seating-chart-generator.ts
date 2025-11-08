
import type { SeatingChart, RefectoryTable, EnrolledStudent } from '@/types/refectory';

const TABLE_CAPACITY = {
    boys: 3,
    girls: 7,
};

const REFECTORY_CONFIG = {
    morning: { first: 28, second: 11 },
    evening: { first: 28, second: 8 },
};

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
            serie: i <= REFECTORY_CONFIG.morning.first ? 1 : 2,
            boys: [],
            girls: [],
        });
    }
    return tables;
}

export function generateSeatingChart(students: EnrolledStudent[], previous?: SeatingChart): SeatingChart {
    const totalMorningTables = REFECTORY_CONFIG.morning.first + REFECTORY_CONFIG.morning.second;
    
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
        console.warn(`${unassignedBoys} boys did not get a seat.`);
    }
    if (unassignedGirls > 0) {
        console.warn(`${unassignedGirls} girls did not get a seat.`);
    }

    const morningShiftTables = masterTables;

    const eveningShiftTables = masterTables
        .map(table => ({
            ...table, 
            boys: table.boys.map(s => ({...s})), 
            girls: table.girls.map(s => ({...s}))
        }))
        .filter(table => {
            if (table.serie === 1) return true;
            const serie2TableIndex = table.tableNumber - REFECTORY_CONFIG.morning.first;
            return serie2TableIndex <= REFECTORY_CONFIG.evening.second;
        });

    return {
        morning: morningShiftTables,
        evening: eveningShiftTables,
    };
}
