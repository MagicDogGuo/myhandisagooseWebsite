import type { LeaderboardEntry } from '@/types/api';

/**
 * Demo leaderboard rows — Phase 2 will swap the data source only.
 * Values are whole-game totals (all levels), not per-level scores.
 */
export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    playerAlias: 'NestRunner',
    clearTimeMs: 312_420,
    dropCount: 3,
  },
  {
    rank: 2,
    playerAlias: 'BreadThief',
    clearTimeMs: 348_180,
    dropCount: 5,
  },
  {
    rank: 3,
    playerAlias: 'HookMaster',
    clearTimeMs: 361_040,
    dropCount: 2,
  },
  {
    rank: 4,
    playerAlias: 'PondAvoider',
    clearTimeMs: 389_900,
    dropCount: 7,
  },
  {
    rank: 5,
    playerAlias: 'BrushPush',
    clearTimeMs: 412_330,
    dropCount: 4,
  },
];
