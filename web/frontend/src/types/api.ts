export interface LeaderboardEntry {
  rank: number;
  playerAlias: string;
  levelId: number;
  clearTimeMs: number;
  dropCount: number;
}

export interface LevelSummary {
  levelId: number;
  title: string;
  promptEn: string;
  trainingFocus: string[];
  screenshots: string[];
}

export interface LevelsListResponse {
  levels: LevelSummary[];
}
