export type FeedbackCategory = 'bug' | 'suggestion' | 'other';

export type CreateFeedbackInput = {
  category: FeedbackCategory;
  levelId?: number;
  message: string;
  email?: string;
};

export type FeedbackRecord = {
  id: string;
  category: FeedbackCategory;
  levelId?: number;
  message: string;
  email?: string;
  createdAt: Date;
};
