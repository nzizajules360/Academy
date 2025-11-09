// TableCard.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { TableIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefectoryTable, EnrolledStudent } from '@/types/refectory';

// Student Avatar Component
const StudentAvatar = ({ student, index }: { student: EnrolledStudent; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
  >
    <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
      student.gender === 'male' 
        ? 'bg-blue-500 shadow-lg shadow-blue-500/25' 
        : 'bg-pink-500 shadow-lg shadow-pink-500/25'
    }`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
        {student.fullName}
      </p>
      <p className="text-xs text-muted-foreground truncate">{student.class}</p>
    </div>
  </motion.div>
);

interface TableCardProps {
  table: RefectoryTable;
  index: number;
  boyCapacity?: number;
  girlCapacity?: number;
}

export const TableCard = ({ 
  table, 
  index, 
  boyCapacity = 3, 
  girlCapacity = 7 
}: TableCardProps) => {
  const boysNeeded = boyCapacity - table.boys.length;
  const girlsNeeded = girlCapacity - table.girls.length;
  const boysPercentage = (table.boys.length / boyCapacity) * 100;
  const girlsPercentage = (table.girls.length / girlCapacity) * 100;
  const totalStudents = table.boys.length + table.girls.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Header with gradient */}
        <CardHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <TableIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Table {table.tableNumber}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="font-semibold">
                    Serie {table.serie}
                  </Badge>
                  <span className="text-xs">• {totalStudents} students</span>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4 flex-grow">
          <div className="space-y-4">
            {/* Boys Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <p className="text-sm font-semibold text-blue-600">Boys</p>
                </div>
                <p className="text-sm font-medium">{table.boys.length}/{boyCapacity}</p>
              </div>
              <Progress 
                value={boysPercentage} 
                className="h-3 bg-blue-100 [&>div]:bg-blue-500 [&>div]:shadow-lg [&>div]:shadow-blue-500/25"
              />
              <AnimatePresence>
                {boysNeeded > 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-blue-600 font-medium"
                  >
                    {boysNeeded} more needed
                  </motion.p>
                )}
                {boysNeeded === 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-600 font-medium"
                  >
                    ✓ Full capacity
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Girls Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  <p className="text-sm font-semibold text-pink-600">Girls</p>
                </div>
                <p className="text-sm font-medium">{table.girls.length}/{girlCapacity}</p>
              </div>
              <Progress 
                value={girlsPercentage} 
                className="h-3 bg-pink-100 [&>div]:bg-pink-500 [&>div]:shadow-lg [&>div]:shadow-pink-500/25"
              />
              <AnimatePresence>
                {girlsNeeded > 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-pink-600 font-medium"
                  >
                    {girlsNeeded} more needed
                  </motion.p>
                )}
                {girlsNeeded === 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-600 font-medium"
                  >
                    ✓ Full capacity
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>

        {/* Student List */}
        {(table.boys.length > 0 || table.girls.length > 0) && (
          <CardFooter className="p-0">
            <ScrollArea className="h-40 w-full">
              <div className="p-4 space-y-1">
                <AnimatePresence>
                  {table.boys.map((student, i) => (
                    <StudentAvatar key={`boy-${student.id}-${i}`} student={student} index={i} />
                  ))}
                  {table.girls.map((student, i) => (
                    <StudentAvatar 
                      key={`girl-${student.id}-${i}`} 
                      student={student} 
                      index={table.boys.length + i} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};