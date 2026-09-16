import { programsSeed } from '@/data/programs';
import type { Program } from '@/types/program';
import { clone, request } from './client';

export function fetchPrograms(): Promise<Program[]> {
  return request(clone(programsSeed));
}

export function createProgram(program: Program): Promise<Program> {
  return request(program);
}

export function updateProgram(program: Program): Promise<Program> {
  return request(program);
}

export function deleteProgram(id: string): Promise<{ id: string }> {
  return request({ id });
}
