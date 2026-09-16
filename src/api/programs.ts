import type { Program } from '@/types/program';
import { request } from './client';

export function fetchPrograms(): Promise<Program[]> {
  return request<Program[]>('/programs/');
}

export function createProgram(program: Program): Promise<Program> {
  return request<Program>('/programs/', {
    method: 'POST',
    body: JSON.stringify(program),
  });
}

export function updateProgram(program: Program): Promise<Program> {
  return request<Program>(`/programs/${program.id}/`, {
    method: 'PATCH',
    body: JSON.stringify(program),
  });
}

export function deleteProgram(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`/programs/${id}/`, {
    method: 'DELETE',
  });
}
