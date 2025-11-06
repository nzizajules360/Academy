export type UserRole = 'admin' | 'secretary' | 'patron' | 'matron';

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
  // Fields below are from the initial data, but not in the secretary form
  type?: 'boarding' | 'external';
  feesPaid?: number;
  totalFees?: number;
  refectoryTable?: number;
  gender?: 'male' | 'female';
  utilities?: MaterialStatus[];
};

export type Material = {
  id: string;
  name: string;
  required: boolean;
};
