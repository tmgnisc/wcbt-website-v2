import { admissionsSeed, admissionsTrendSeed } from '@/data/admissions';
import type { Admission } from '@/types/admission';
import { clone, request } from './client';

export function fetchAdmissions(): Promise<Admission[]> {
  return request(clone(admissionsSeed));
}

export function fetchAdmissionsTrend(): Promise<typeof admissionsTrendSeed> {
  return request(clone(admissionsTrendSeed));
}

export function createAdmission(admission: Admission): Promise<Admission> {
  return request(admission);
}

export function updateAdmission(admission: Admission): Promise<Admission> {
  return request(admission);
}

export function deleteAdmission(id: string): Promise<{ id: string }> {
  return request({ id });
}
