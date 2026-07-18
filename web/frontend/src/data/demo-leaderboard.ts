import type { LeaderboardEntry } from '@/types/api';

/**
 * Demo leaderboard rows — Phase 2 will swap the data source only.
 * Shape matches the planned live API.
 */
export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    playerAlias: 'NestRunner',
    levelId: 0,
    clearTimeMs: 38_420,
    dropCount: 0,
  },
  {
    rank: 2,
    playerAlias: 'BreadThief',
    levelId: 1,
    clearTimeMs: 52_180,
    dropCount: 1,
  },
  {
    rank: 3,
    playerAlias: 'HookMaster',
    levelId: 1,
    clearTimeMs: 61_040,
    dropCount: 0,
  },
  {
    rank: 4,
    playerAlias: 'PondAvoider',
    levelId: 2,
    clearTimeMs: 74_900,
    dropCount: 2,
  },
  {
    rank: 5,
    playerAlias: 'BrushPush',
    levelId: 3,
    clearTimeMs: 89_330,
    dropCount: 1,
  },
];
