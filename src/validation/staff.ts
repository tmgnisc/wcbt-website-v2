import { z } from 'zod';
import { EMPLOYMENT_TYPES, GENDERS, STAFF_STATUSES } from '@/types/staff';

export const staffSchema = z.object({
  // Personal
  fullName: z.string().trim().min(3, 'Full name is required'),
  gender: z.enum(GENDERS as [string, ...string[]]),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  citizenshipNo: z.string().trim().min(3, 'Citizenship / ID number is required'),
  address: z.string().trim().min(3, 'Address is required'),
  phone: z.string().trim().min(7, 'Enter a valid phone number'),
  email: z.email('Enter a valid email address'),
  photoUrl: z.string().optional(),

  // Employment
  staffId: z.string().min(1),
  department: z.string().min(1, 'Select a department'),
  designation: z.string().min(1, 'Select a designation'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  employmentType: z.enum(EMPLOYMENT_TYPES as [string, ...string[]]),
  reportingManagerId: z.string().optional().nullable(),
  salary: z.coerce.number().min(0, 'Salary cannot be negative'),

  // Account
  username: z.string().trim().min(3, 'Username is required'),
  role: z.enum(['super_admin', 'admin', 'staff']),
  loginEnabled: z.boolean(),
  status: z.enum(STAFF_STATUSES as [string, ...string[]]),
});

export type StaffFormValues = z.input<typeof staffSchema>;
export type StaffFormOutput = z.output<typeof staffSchema>;

/** Fields grouped per tab so the form can flag which tab holds a validation error. */
export const STAFF_TAB_FIELDS: Record<string, (keyof StaffFormValues)[]> = {
  personal: ['fullName', 'gender', 'dateOfBirth', 'citizenshipNo', 'address', 'phone', 'email'],
  employment: ['staffId', 'department', 'designation', 'joiningDate', 'employmentType', 'salary'],
  account: ['username', 'role', 'loginEnabled', 'status'],
  documents: [],
};
