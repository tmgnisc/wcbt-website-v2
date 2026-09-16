import type { StaffMember } from '@/types/staff';
import { request } from './client';

export function fetchStaff(): Promise<StaffMember[]> {
  return request<StaffMember[]>('/staff/');
}

export function createStaff(member: StaffMember): Promise<StaffMember> {
  return request<StaffMember>('/staff/', {
    method: 'POST',
    body: JSON.stringify(member),
  });
}

export function updateStaff(member: StaffMember): Promise<StaffMember> {
  return request<StaffMember>(`/staff/${member.id}/`, {
    method: 'PATCH',
    body: JSON.stringify(member),
  });
}

export function deleteStaff(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/staff/${id}/`, {
    method: 'DELETE',
  });
}
