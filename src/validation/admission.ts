import { z } from 'zod';
import { GENDERS } from '@/types/staff';
import { PROGRAMS, TEST_STATUSES } from '@/types/admission';

export const admissionSchema = z.object({
  // Personal
  fullName: z.string().trim().min(3, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(GENDERS as [string, ...string[]]),
  nationality: z.string().trim().min(2, 'Nationality is required'),
  address: z.string().trim().min(3, 'Address is required'),
  phone: z.string().trim().min(7, 'Enter a valid phone number'),
  email: z.email('Enter a valid email address'),
  photoUrl: z.string().optional(),

  // Academic background
  previousInstitution: z.string().trim().min(2, 'Previous institution is required'),
  board: z.string().trim().min(2, 'Board is required'),
  gpa: z.string().trim().min(1, 'GPA or percentage is required'),
  subjects: z.array(z.string()).default([]),

  // Program
  program: z.enum(PROGRAMS as unknown as [string, ...string[]]),
  intake: z.string().trim().min(2, 'Intake is required'),
  scholarshipInterest: z.boolean(),

  // Test
  testDate: z.string().optional().nullable(),
  testScore: z
    .union([z.coerce.number().min(0, 'Score cannot be negative').max(100, 'Score is out of 100'), z.null()])
    .optional(),
  testStatus: z.enum(TEST_STATUSES as [string, ...string[]]),
  interviewNotes: z.string().optional(),

  internalNotes: z.string().optional(),
});

export type AdmissionFormValues = z.input<typeof admissionSchema>;

export const ADMISSION_TAB_FIELDS: Record<string, string[]> = {
  personal: ['fullName', 'dateOfBirth', 'gender', 'nationality', 'address', 'phone', 'email'],
  academic: ['previousInstitution', 'board', 'gpa'],
  program: ['program', 'intake'],
  documents: [],
  test: ['testScore'],
};
