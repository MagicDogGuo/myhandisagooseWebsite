import { AppError } from '../../errors/app-error.js';
import type { PollsRepository } from './polls-repository.js';
import type { PollRecord, PollResult } from './types/index.js';
import type { VoteGuard } from './vote-guard.js';

export type CastVoteParams = {
  pollId: string;
  optionId: string;
  voterToken: string;
  clientIp: string;
};

export class PollsService {
  constructor(
    private readonly repository: PollsRepository,
    private readonly voteGuard: VoteGuard,
  ) {}

  async listPolls(voterToken: string | undefined): Promise<PollResult[]> {
    const polls = await this.repository.listActivePolls();
    return Promise.all(
      polls.map((poll) => this.toPollResult(poll, voterToken)),
    );
  }

  async castVote(params: CastVoteParams): Promise<PollResult> {
    const poll = await this.repository.findPollById(params.pollId);
    if (!poll || !poll.isActive) {
      throw new AppError('NOT_FOUND', 'Poll not found', 404);
    }

    const optionExists = poll.options.some(
      (option) => option.id === params.optionId,
    );
    if (!optionExists) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid option for this poll',
        400,
      );
    }

    const existing = await this.repository.findVoteByPollAndToken(
      params.pollId,
      params.voterToken,
    );
    if (existing) {
      throw new AppError('ALREADY_VOTED', 'Already voted on this poll', 409);
    }

    const ipHash = this.voteGuard.hashIp(params.clientIp);
    this.voteGuard.assertWithinRateLimit(ipHash);

    await this.repository.createVote({
      pollId: params.pollId,
      optionId: params.optionId,
      voterToken: params.voterToken,
      ipHash,
    });

    return this.toPollResult(poll, params.voterToken);
  }

  private async toPollResult(
    poll: PollRecord,
    voterToken: string | undefined,
  ): Promise<PollResult> {
    const counts = await this.repository.countVotesByOption(poll.id);
    const options = poll.options.map((option) => ({
      id: option.id,
      label: option.label,
      voteCount: counts.get(option.id) ?? 0,
    }));
    const totalVotes = options.reduce(
      (sum, option) => sum + option.voteCount,
      0,
    );

    let myVote: string | null = null;
    if (voterToken) {
      const existing = await this.repository.findVoteByPollAndToken(
        poll.id,
        voterToken,
      );
      myVote = existing?.optionId ?? null;
    }

    return {
      id: poll.id,
      question: poll.question,
      options,
      totalVotes,
      myVote,
    };
  }
}
