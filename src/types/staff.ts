import type { ActivityEntry, FileRecord } from './common';
import type { Role } from './auth';

export type StaffStatus = 'Active' | 'Inactive' | 'On Leave';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Visiting';
export type Gender = 'Male' | 'Female' | 'Other';

export const STAFF_STATUSES: StaffStatus[] = ['Active', 'Inactive', 'On Leave'];
export const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Visiting'];
export const GENDERS: Gender[] = ['Male', 'Female', 'Other'];

export interface StaffMember {
  id: string;
  staffId: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  citizenshipNo: string;
  address: string;
  phone: string;
  email: string;
  photoUrl?: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: EmploymentType;
  reportingManagerId?: string | null;
  salary: number;
  username: string;
  role: Role;
  loginEnabled: boolean;
  status: StaffStatus;
  documents: FileRecord[];
  activity: ActivityEntry[];
}

export type StaffDraft = Omit<StaffMember, 'id' | 'activity'>;
