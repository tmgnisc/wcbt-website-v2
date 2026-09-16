import type { Program } from '@/types/program';

export const programsSeed: Program[] = [
  {
    id: 'prg-001',
    code: 'BIT',
    name: 'Bachelor of Information Technology',
    level: 'Bachelor',
    department: 'Information Technology',
    affiliation: 'Kathmandu University',
    durationYears: 4,
    semesters: 8,
    seats: 48,
    feePerYear: 185000,
    coordinator: 'Sushmita Karki',
    status: 'Active',
    description:
      'Software engineering, networking and data management with a final-year industry project.',
    createdAt: '2019-04-14T04:00:00Z',
    updatedAt: '2026-08-02T06:30:00Z',
  },
  {
    id: 'prg-002',
    code: 'B.Tech Ed IT',
    name: 'Bachelor of Technology Education in Information Technology',
    level: 'Bachelor',
    department: 'Information Technology',
    affiliation: 'Kathmandu University',
    durationYears: 4,
    semesters: 8,
    seats: 32,
    feePerYear: 145000,
    coordinator: 'Nabin Adhikari',
    status: 'Active',
    description:
      'Prepares secondary-level IT teachers; includes a teaching practicum in partner schools.',
    createdAt: '2021-05-20T04:00:00Z',
    updatedAt: '2026-07-18T09:15:00Z',
  },
];
