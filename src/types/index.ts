export type UserRole = 'admin' | 'secretary' | 'patron' | 'matron' | 'teacher';

export type MaterialStatus = {
  materialId: string;
  status: 'present' | 'missing';
};

export type Student = {
  id: string;
  name: string;
  class: string;
  location: string;
  parentName: string;
  parentPhone: string;
  totalFees: number;
  feesPaid: number;
  // Fields below are from the initial data, but not in the secretary form
  type?: 'boarding' | 'external';
  refectoryTable?: number;
  refectoryTableMorning?: number;
  refectoryTableEvening?: number;
  gender?: 'male' | 'female';
  religion?: 'Adventist' | 'Abahamya' | 'Catholic' | 'Ajepra' | 'Muslim';
  utilities?: MaterialStatus[];
};

export type Material = {
  id: string;
  name: string;
  required: boolean;
};
