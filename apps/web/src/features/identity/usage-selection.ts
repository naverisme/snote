import type { Account } from '../../shared/types';

export type ClassroomUsage = 'student' | 'teacher';

export function toAccountUsages(selected: readonly ClassroomUsage[]): Account['usages'] {
  const classroom = (['student', 'teacher'] as const).filter(usage => selected.includes(usage));
  return classroom.length > 0 ? [...classroom] : ['personal'];
}

export function toggleClassroomUsage(current: Account['usages'], usage: ClassroomUsage): Account['usages'] {
  const selected = (['student', 'teacher'] as const).filter(value =>
    value === usage ? !current.includes(value) : current.includes(value),
  );
  return toAccountUsages(selected);
}
