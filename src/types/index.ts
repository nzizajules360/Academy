export type UserRole = 'admin' | 'secretary' | 'patron' | 'matron';

export type MaterialStatus = {
  materialId: string;
  status: 'present' | 'missing';
};

export type Student = {
  id: string;
  name: string;
  class: string;
  type: 'boarding' | 'external';
  parentName: string;
  parentPhone: string;
  location: string;
  feesPaid: number;
  totalFees: number;
  refectoryTable: number;
  gender: 'male' | 'female';
  utilities: MaterialStatus[];
};

export type Material = {
  id: string;
  name: string;
  required: boolean;
};
