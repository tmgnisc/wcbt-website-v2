import { staffSeed } from '@/data/staff';
import type { StaffMember } from '@/types/staff';
import { clone, request } from './client';

export function fetchStaff(): Promise<StaffMember[]> {
  return request(clone(staffSeed));
}

export function createStaff(member: StaffMember): Promise<StaffMember> {
  return request(member);
}

export function updateStaff(member: StaffMember): Promise<StaffMember> {
  return request(member);
}

export function deleteStaff(id: string): Promise<{ id: string }> {
  return request({ id });
}
