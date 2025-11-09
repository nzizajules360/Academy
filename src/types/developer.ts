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
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canViewLogs: boolean;
    canDeploySystem: boolean;
  };
  settings: {
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
  };
  profile: {
    githubUsername?: string;
    phoneNumber?: string;
    position?: string;
    department?: string;
  };
}