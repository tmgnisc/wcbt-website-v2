import type { AuthUser } from '@/types/auth';

/** Mock credential table — replace with a real auth endpoint in /src/api/auth.ts. */
export interface MockAccount extends AuthUser {
  password: string;
}

export const accountsSeed: MockAccount[] = [
  {
    id: 'stf-001',
    name: 'Dr. Rajendra Bhattarai',
    email: 'principal@wcbt.edu.np',
    role: 'super_admin',
    department: 'Administration',
    password: 'wcbt1234',
  },
  {
    id: 'stf-004',
    name: 'Anita Rai',
    email: 'admissions@wcbt.edu.np',
    role: 'admin',
    department: 'Admissions',
    password: 'wcbt1234',
  },
  {
    id: 'stf-003',
    name: 'Nabin Adhikari',
    email: 'nabin@wcbt.edu.np',
    role: 'staff',
    department: 'Information Technology',
    password: 'wcbt1234',
  },
];
