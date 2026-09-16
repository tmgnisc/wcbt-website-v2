import type { Admission } from '@/types/admission';
import { request } from './client';

type AdmissionTrend = { month: string; applications: number; enrolled: number }[];

export function fetchAdmissions(): Promise<Admission[]> {
  return request<Admission[]>('/admissions/');
}

export function fetchAdmissionsTrend(): Promise<AdmissionTrend> {
  return request<AdmissionTrend>('/admissions/trend/');
}

export function createAdmission(admission: Admission): Promise<Admission> {
  return request<Admission>('/admissions/', {
    method: 'POST',
    body: JSON.stringify(admission),
  });
}

export function updateAdmission(admission: Admission): Promise<Admission> {
  return request<Admission>(`/admissions/${admission.id}/`, {
    method: 'PATCH',
    body: JSON.stringify(admission),
  });
}

export function deleteAdmission(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/admissions/${id}/`, {
    method: 'DELETE',
  });
}

export function bulkUpdateStatus(
  ids: string[],
  status: string,
): Promise<void> {
  return request<void>('/admissions/bulk-status/', {
    method: 'POST',
    body: JSON.stringify({ ids, status }),
  });
}

export function convertToStudent(id: string): Promise<Admission> {
  return request<Admission>(`/admissions/${id}/convert/`, {
    method: 'POST',
  });
}
