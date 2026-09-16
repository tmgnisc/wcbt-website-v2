import { z } from 'zod';
import { PROGRAM_LEVELS, PROGRAM_STATUSES } from '@/types/program';

/** Number inputs register with `valueAsNumber`, so an empty field arrives as NaN. */
const count = (label: string, max: number) =>
  z
    .number({ error: `${label} is required` })
    .int(`${label} must be a whole number`)
    .min(1, `${label} must be at least 1`)
    .max(max, `${label} cannot exceed ${max}`);

export const programSchema = z.object({
  code: z.string().trim().min(2, 'Code is required').max(16, 'Keep the code under 16 characters'),
  name: z
    .string()
    .trim()
    .min(3, 'Program name is required')
    .max(120, 'Keep the name under 120 characters'),
  level: z.enum(PROGRAM_LEVELS),
  department: z.string().min(1, 'Department is required'),
  affiliation: z.string().trim().min(2, 'Affiliation is required'),
  durationYears: count('Duration', 8),
  semesters: count('Semesters', 16),
  seats: count('Seats', 500),
  feePerYear: z
    .number({ error: 'Annual fee is required' })
    .min(0, 'Fee cannot be negative')
    .max(10_000_000, 'Fee looks too large'),
  coordinator: z.string().trim().min(2, 'Coordinator is required'),
  status: z.enum(PROGRAM_STATUSES),
  description: z.string().trim().max(240, 'Keep the description under 240 characters'),
});

export type ProgramFormValues = z.infer<typeof programSchema>;
