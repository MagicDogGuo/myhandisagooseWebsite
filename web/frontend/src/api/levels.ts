import { apiFetch } from '@/api/client';
import type { LevelDoc, LevelsListResponse } from '@/types/api';

export function fetchLevelSummaries() {
  return apiFetch<LevelsListResponse>('/api/v1/levels');
}

export function fetchLevelById(levelId: number) {
  return apiFetch<LevelDoc>(`/api/v1/levels/${levelId}`);
}
