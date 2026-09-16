export const PROGRAM_LEVELS = ['Bachelor', 'Master', 'Diploma', 'Certificate'] as const;
export type ProgramLevel = (typeof PROGRAM_LEVELS)[number];

export const PROGRAM_STATUSES = ['Active', 'Inactive'] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export interface Program {
  id: string;
  /** Short code shown on applications; also the join key for `Admission.program`. */
  code: string;
  name: string;
  level: ProgramLevel;
  department: string;
  affiliation: string;
  durationYears: number;
  semesters: number;
  /** Sanctioned intake per academic session. */
  seats: number;
  feePerYear: number;
  coordinator: string;
  status: ProgramStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProgramDraft = Omit<Program, 'id' | 'createdAt' | 'updatedAt'>;
