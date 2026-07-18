import { apiFetch } from '@/api/client';
import type { LevelsListResponse } from '@/types/api';

export function fetchLevelSummaries() {
  return apiFetch<LevelsListResponse>('/api/v1/levels');
}
