export interface Developer {
  uid: string;
  email: string;
  displayName?: string;
  role: 'developer';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  lastLogin?: string;
  approvedBy?: string;
  approvedAt?: string;
}