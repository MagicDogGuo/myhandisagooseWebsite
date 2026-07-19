import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../../errors/app-error.js';
import { PollsService } from './polls-service.js';
import type { PollsRepository } from './polls-repository.js';
import type { PollRecord, VoteRecord } from './types/index.js';
import { VoteGuard } from './vote-guard.js';

const poll: PollRecord = {
  id: '507f1f77bcf86cd799439011',
  question: 'What next?',
  options: [
    { id: 'patrol', label: 'Patrol' },
    { id: 'bread', label: 'Bread' },
  ],
  isActive: true,
  createdAt: new Date(),
};

function createRepo(
  overrides: Partial<PollsRepository> = {},
): PollsRepository {
  return {
    listActivePolls: vi.fn(),
    findPollById: vi.fn(async () => poll),
    countVotesByOption: vi.fn(async () => new Map([['patrol', 0]])),
    findVoteByPollAndToken: vi.fn(async () => null),
    createVote: vi.fn(async (input) => ({
      id: 'vote-1',
      pollId: input.pollId,
      optionId: input.optionId,
      voterToken: input.voterToken,
      ipHash: input.ipHash,
      createdAt: new Date(),
    })),
    createPoll: vi.fn(),
    countActivePolls: vi.fn(),
    ...overrides,
  } as unknown as PollsRepository;
}

describe('PollsService.castVote', () => {
  const guard = new VoteGuard({
    ipHashSecret: 'test-ip-hash-secret',
    windowMs: 60_000,
    maxVotesPerWindow: 10,
  });

  it('rejects duplicate voter token with ALREADY_VOTED', async () => {
    const existing: VoteRecord = {
      id: 'vote-existing',
      pollId: poll.id,
      optionId: 'patrol',
      voterToken: 'tok',
      ipHash: 'abc',
      createdAt: new Date(),
    };
    const repository = createRepo({
      findVoteByPollAndToken: vi.fn(async () => existing),
      createVote: vi.fn(),
    });
    const service = new PollsService(repository, guard);

    await expect(
      service.castVote({
        pollId: poll.id,
        optionId: 'bread',
        voterToken: 'tok',
        clientIp: '127.0.0.1',
      }),
    ).rejects.toMatchObject({
      code: 'ALREADY_VOTED',
      httpStatus: 409,
    });
    expect(repository.createVote).not.toHaveBeenCalled();
  });

  it('rejects unknown option', async () => {
    const repository = createRepo();
    const service = new PollsService(repository, guard);

    await expect(
      service.castVote({
        pollId: poll.id,
        optionId: 'nope',
        voterToken: 'tok',
        clientIp: '127.0.0.1',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('persists vote and returns myVote', async () => {
    const createVote = vi.fn(async (input) => ({
      id: 'vote-1',
      pollId: input.pollId,
      optionId: input.optionId,
      voterToken: input.voterToken,
      ipHash: input.ipHash,
      createdAt: new Date(),
    }));
    const findVoteByPollAndToken = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'vote-1',
        pollId: poll.id,
        optionId: 'patrol',
        voterToken: 'tok',
        ipHash: 'hash',
        createdAt: new Date(),
      });

    const repository = createRepo({
      createVote,
      findVoteByPollAndToken,
      countVotesByOption: vi.fn(async () => new Map([['patrol', 1]])),
    });
    const service = new PollsService(repository, guard);

    const result = await service.castVote({
      pollId: poll.id,
      optionId: 'patrol',
      voterToken: 'tok',
      clientIp: '127.0.0.1',
    });

    expect(createVote).toHaveBeenCalledOnce();
    expect(result.myVote).toBe('patrol');
    expect(result.totalVotes).toBe(1);
  });
});
