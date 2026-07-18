export interface LeaderboardEntry {
  rank: number;
  playerAlias: string;
  clearTimeMs: number;
  dropCount: number;
}

export interface Pitfall {
  title: string;
  detail: string;
}

export interface LevelSummary {
  levelId: number;
  title: string;
  promptEn: string;
  trainingFocus: string[];
  screenshots: string[];
}

export interface LevelDoc extends LevelSummary {
  bodyMd: string;
  pitfalls: Pitfall[];
}

export interface LevelsListResponse {
  levels: LevelSummary[];
}
