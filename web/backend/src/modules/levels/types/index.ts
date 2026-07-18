export type Pitfall = {
  title: string;
  detail: string;
};

export type LevelDoc = {
  levelId: number;
  title: string;
  promptEn: string;
  trainingFocus: string[];
  screenshots: string[];
  bodyMd: string;
  pitfalls: Pitfall[];
};

export type LevelSummary = Pick<
  LevelDoc,
  'levelId' | 'title' | 'promptEn' | 'trainingFocus' | 'screenshots'
>;
