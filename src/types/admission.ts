import type { FileRecord } from './common';
import type { Gender } from './staff';

export type AdmissionStage =
  | 'Applied'
  | 'Document Verification'
  | 'Test/Interview'
  | 'Result'
  | 'Enrolled'
  | 'Rejected';

export type TestStatus = 'Not Scheduled' | 'Scheduled' | 'Passed' | 'Failed';

/** Matches `Program.code`; the Programs module owns the list of valid values. */
export type ProgramCode = string;

/** Ordered stages of the pipeline; "Rejected" sits outside the happy path. */
export const ADMISSION_STAGES: AdmissionStage[] = [
  'Applied',
  'Document Verification',
  'Test/Interview',
  'Result',
  'Enrolled',
];

export const ADMISSION_STAGES_WITH_REJECTED: AdmissionStage[] = [
  ...ADMISSION_STAGES,
  'Rejected',
];

export const TEST_STATUSES: TestStatus[] = ['Not Scheduled', 'Scheduled', 'Passed', 'Failed'];

export interface Admission {
  id: string;
  applicationId: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  photoUrl?: string;
  previousInstitution: string;
  board: string;
  gpa: string;
  subjects: string[];
  program: ProgramCode;
  intake: string;
  scholarshipInterest: boolean;
  documents: FileRecord[];
  testDate?: string | null;
  testScore?: number | null;
  testStatus: TestStatus;
  interviewNotes?: string;
  status: AdmissionStage;
  appliedDate: string;
  internalNotes?: string;
  convertedToStudent: boolean;
}

export type AdmissionDraft = Omit<Admission, 'id'>;
