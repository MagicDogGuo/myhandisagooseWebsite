export type PollOption = {
  id: string;
  label: string;
};

export type PollRecord = {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  createdAt: Date;
};

export type VoteRecord = {
  id: string;
  pollId: string;
  optionId: string;
  voterToken: string;
  ipHash: string;
  createdAt: Date;
};

export type PollOptionResult = {
  id: string;
  label: string;
  voteCount: number;
};

export type PollResult = {
  id: string;
  question: string;
  options: PollOptionResult[];
  totalVotes: number;
  myVote: string | null;
};

export type CastVoteInput = {
  pollId: string;
  optionId: string;
  voterToken: string;
  ipHash: string;
};
