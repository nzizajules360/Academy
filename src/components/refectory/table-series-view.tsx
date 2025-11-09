// TableSeriesView.tsx
'use client';

import { useState, useMemo } from 'react';
import { DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, User, FileDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TableCard } from '@/components/ui/table-card';
import { EnrolledStudent } from '@/types/refectory';

const SeriesConfig = {
  morning: { first: 28, second: 11 },
  evening: { first: 28, second: 8 },
};

const TableTotals = {
  morning: SeriesConfig.morning.first + SeriesConfig.morning.second,
  evening: SeriesConfig.evening.first + SeriesConfig.evening.second,
};

interface TableSeriesViewProps {
  students: DocumentData[];
  meal: 'morning' | 'evening';
}

export function TableSeriesView({ students, meal }: TableSeriesViewProps) {
  const [activeTab, setActiveTab] = useState('1');
  const tableField = meal === 'morning' ? 'refectoryTableMorning' : 'refectoryTableEvening';

  const tables = useMemo(() => {
    const allTables: { [key: string]: { boys: EnrolledStudent[], girls: EnrolledStudent[], serie: string, tableNumber: string } } = {};
    
    students.forEach(student => {
      const tableNumber = student[tableField];
      if (!tableNumber) return;
      
      const serie = Number(tableNumber) <= (meal === 'morning' ? SeriesConfig.morning.first : SeriesConfig.evening.first) ? '1' : '2';
      
      if (!allTables[tableNumber]) {
        allTables[tableNumber] = {
          boys: [],
          girls: [],
          serie,
          tableNumber
        };
      }
      
      const studentData: EnrolledStudent = {
        id: student.id,
        fullName: student.name,
        class: student.class,
        gender: student.gender,
      };
      
      if (student.gender === 'male') {
        allTables[tableNumber].boys.push(studentData);
      } else {
        allTables[tableNumber].girls.push(studentData);
      }
    });
    
    return Object.values(allTables);
  }, [students, tableField, meal]);

  const series = {
    first: tables.filter(t => t.serie === '1'),
    second: tables.filter(t => t.serie === '2'),
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="1">
            Serie 1 ({series.first.length} tables)
          </TabsTrigger>
          <TabsTrigger value="2">
            Serie 2 ({series.second.length} tables)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {series.first.sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber)).map((table, index) => (
              <TableCard 
                key={table.tableNumber} 
                table={table} 
                index={index}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="2" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {series.second.sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber)).map((table, index) => (
              <TableCard 
                key={table.tableNumber} 
                table={table} 
                index={index}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}