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

export interface PollOptionResult {
  id: string;
  label: string;
  voteCount: number;
}

export interface PollResult {
  id: string;
  question: string;
  options: PollOptionResult[];
  totalVotes: number;
  myVote: string | null;
}

export interface PollsListResponse {
  polls: PollResult[];
}

export interface CastVoteResponse {
  poll: PollResult;
}

export interface PressAsset {
  id: string;
  title: string;
  description: string;
  relativePath: string;
  downloadCount: number;
}

export interface PressAssetsResponse {
  assets: PressAsset[];
}
