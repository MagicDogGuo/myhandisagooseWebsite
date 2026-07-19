import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../../app.js';
import { AppError } from '../../errors/app-error.js';
import {
  createSilentLogger,
  createTestControllers,
} from '../../test/create-test-controllers.js';
import { createTestConfig } from '../../test/test-config.js';
import type { CastVoteParams } from './polls-service.js';
import type { PollResult } from './types/index.js';
import { VOTER_TOKEN_COOKIE } from './polls-schema.js';

const samplePoll: PollResult = {
  id: '507f1f77bcf86cd799439011',
  question: 'What should we add next?',
  options: [
    { id: 'patrol', label: 'Patrol officer gameplay', voteCount: 1 },
    { id: 'bread', label: 'More bread varieties', voteCount: 0 },
  ],
  totalVotes: 1,
  myVote: 'patrol',
};

describe('polls API', () => {
  it('GET /api/v1/polls returns polls with myVote from cookie', async () => {
    const listPolls = vi.fn(async (token?: string) => [
      { ...samplePoll, myVote: token === 'tok-1' ? 'patrol' : null },
    ]);

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        {
          polls: {
            service: {
              listPolls,
              castVote: vi.fn(),
            },
          },
        },
      ),
    });

    const res = await request(app)
      .get('/api/v1/polls')
      .set('Cookie', `${VOTER_TOKEN_COOKIE}=tok-1`);

    expect(res.status).toBe(200);
    expect(res.body.polls).toHaveLength(1);
    expect(res.body.polls[0].myVote).toBe('patrol');
    expect(listPolls).toHaveBeenCalledWith('tok-1');
  });

  it('POST vote issues voter_token cookie and returns updated poll', async () => {
    const castVote = vi.fn(async (params: CastVoteParams) => ({
      ...samplePoll,
      id: params.pollId,
      myVote: params.optionId,
    }));

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        { polls: { service: { listPolls: vi.fn(), castVote } } },
      ),
    });

    const res = await request(app)
      .post(`/api/v1/polls/${samplePoll.id}/vote`)
      .send({ optionId: 'patrol' });

    expect(res.status).toBe(200);
    expect(res.body.poll.myVote).toBe('patrol');
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(new RegExp(`^${VOTER_TOKEN_COOKIE}=`)),
      ]),
    );
    expect(castVote).toHaveBeenCalledWith(
      expect.objectContaining({
        pollId: samplePoll.id,
        optionId: 'patrol',
        voterToken: expect.any(String),
        clientIp: expect.any(String),
      }),
    );
  });

  it('POST vote with same cookie returns 409 ALREADY_VOTED', async () => {
    const castVote = vi.fn(async () => {
      throw new AppError('ALREADY_VOTED', 'Already voted on this poll', 409);
    });

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        { polls: { service: { listPolls: vi.fn(), castVote } } },
      ),
    });

    const res = await request(app)
      .post(`/api/v1/polls/${samplePoll.id}/vote`)
      .set('Cookie', `${VOTER_TOKEN_COOKIE}=existing-token`)
      .send({ optionId: 'bread' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: {
        code: 'ALREADY_VOTED',
        message: 'Already voted on this poll',
      },
    });
    expect(castVote).toHaveBeenCalledWith(
      expect.objectContaining({ voterToken: 'existing-token' }),
    );
  });

  it('returns 400 for invalid vote payload', async () => {
    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(),
    });

    const res = await request(app)
      .post(`/api/v1/polls/${samplePoll.id}/vote`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
