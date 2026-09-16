import type { PermissionAction, PermissionMatrix, PermissionModule, Settings } from '@/types/settings';

export const PERMISSION_MODULES: PermissionModule[] = [
  'notifications',
  'staff',
  'admissions',
  'programs',
  'settings',
];

export const PERMISSION_ACTIONS: PermissionAction[] = ['view', 'add', 'edit', 'delete'];

const allowAll = (): Record<PermissionAction, boolean> => ({
  view: true,
  add: true,
  edit: true,
  delete: true,
});

const viewOnly = (): Record<PermissionAction, boolean> => ({
  view: true,
  add: false,
  edit: false,
  delete: false,
});

const permissionMatrix: PermissionMatrix = {
  super_admin: {
    notifications: allowAll(),
    staff: allowAll(),
    admissions: allowAll(),
    programs: allowAll(),
    settings: allowAll(),
  },
  admin: {
    notifications: allowAll(),
    staff: { view: true, add: true, edit: true, delete: false },
    admissions: allowAll(),
    programs: { view: true, add: true, edit: true, delete: false },
    settings: { view: true, add: false, edit: true, delete: false },
  },
  staff: {
    notifications: viewOnly(),
    staff: viewOnly(),
    admissions: viewOnly(),
    programs: viewOnly(),
    settings: { view: false, add: false, edit: false, delete: false },
  },
};

export const settingsSeed: Settings = {
  general: {
    collegeName: 'WhiteHouse College of Business & Technology',
    tagline: 'Learn. Innovate. Lead.',
    campusName: 'Birtamod Campus',
    address: 'Birtamod-4, Jhapa, Province 1, Nepal',
    phone: '+977 23 543210',
    email: 'info@whitehouseeducation.edu.np',
    website: 'https://whitehouseeducation.edu.np',
    logoUrl: '/logo.png',
    academicSession: '2026 / 2027',
  },
  users: [
    {
      id: 'usr-001',
      name: 'Dr. Rajendra Bhattarai',
      email: 'principal@wcbt.edu.np',
      role: 'super_admin',
      status: 'Active',
      lastLogin: '2026-09-16T02:30:00Z',
    },
    {
      id: 'usr-002',
      name: 'Anita Rai',
      email: 'admissions@wcbt.edu.np',
      role: 'admin',
      status: 'Active',
      lastLogin: '2026-09-15T09:10:00Z',
    },
    {
      id: 'usr-003',
      name: 'Sushmita Karki',
      email: 'sushmita.karki@wcbt.edu.np',
      role: 'admin',
      status: 'Active',
      lastLogin: '2026-09-14T11:45:00Z',
    },
    {
      id: 'usr-004',
      name: 'Nabin Adhikari',
      email: 'nabin@wcbt.edu.np',
      role: 'staff',
      status: 'Active',
      lastLogin: '2026-09-12T05:20:00Z',
    },
    {
      id: 'usr-005',
      name: 'Sarita Pokhrel',
      email: 'sarita.pokhrel@wcbt.edu.np',
      role: 'staff',
      status: 'Inactive',
      lastLogin: '2026-06-28T07:00:00Z',
    },
  ],
  permissions: permissionMatrix,
  catalog: {
    departments: [
      { id: 'dep-001', name: 'Information Technology' },
      { id: 'dep-002', name: 'Management' },
      { id: 'dep-003', name: 'Mathematics & Statistics' },
      { id: 'dep-004', name: 'Administration' },
      { id: 'dep-005', name: 'Admissions' },
      { id: 'dep-006', name: 'Examination' },
      { id: 'dep-007', name: 'Accounts' },
      { id: 'dep-008', name: 'Library' },
    ],
    designations: [
      { id: 'des-001', name: 'Principal' },
      { id: 'des-002', name: 'Head of Department' },
      { id: 'des-003', name: 'Assistant Professor' },
      { id: 'des-004', name: 'Lecturer' },
      { id: 'des-005', name: 'Lab Instructor' },
      { id: 'des-006', name: 'Admissions Officer' },
      { id: 'des-007', name: 'Exam Coordinator' },
      { id: 'des-008', name: 'Accountant' },
      { id: 'des-009', name: 'Librarian' },
      { id: 'des-010', name: 'Front Desk Officer' },
    ],
    testTypes: [
      { id: 'tst-001', name: 'Written Entrance', description: '100 marks, 2 hours' },
      { id: 'tst-002', name: 'Technical Interview' },
      { id: 'tst-003', name: 'Teaching Demo', description: 'B.Tech Ed IT applicants only' },
    ],
  },
  notifications: {
    defaultAudience: ['Students', 'Staff'],
    emailAlerts: true,
    smsAlerts: false,
    digestFrequency: 'Daily',
  },
  security: {
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSymbol: false,
    sessionTimeout: 30,
    twoFactorEnabled: false,
  },
  auditLog: [
    { id: 'aud-001', user: 'Anita Rai', action: 'Updated application status to Enrolled', module: 'Admissions', timestamp: '2026-09-16T03:12:00Z', ip: '10.14.2.31' },
    { id: 'aud-002', user: 'Manoj Ghimire', action: 'Published notification', module: 'Notifications', timestamp: '2026-09-14T04:05:00Z', ip: '10.14.2.18' },
    { id: 'aud-003', user: 'Dr. Rajendra Bhattarai', action: 'Changed role permissions', module: 'Settings', timestamp: '2026-09-13T10:40:00Z', ip: '10.14.2.2' },
    { id: 'aud-004', user: 'Sushmita Karki', action: 'Created staff record WCBT-S-0012', module: 'Staff', timestamp: '2026-09-11T06:25:00Z', ip: '10.14.2.9' },
    { id: 'aud-005', user: 'Anita Rai', action: 'Exported applicant list (CSV)', module: 'Admissions', timestamp: '2026-09-10T08:55:00Z', ip: '10.14.2.31' },
    { id: 'aud-006', user: 'Pratima Dahal', action: 'Archived notification', module: 'Notifications', timestamp: '2026-09-06T04:00:00Z', ip: '10.14.2.44' },
  ],
};
