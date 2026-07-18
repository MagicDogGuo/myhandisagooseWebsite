import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../../app.js';
import type {
  CreateFeedbackInput,
  FeedbackRecord,
} from './types/index.js';
import { createTestConfig } from '../../test/test-config.js';
import {
  createSilentLogger,
  createTestControllers,
} from '../../test/create-test-controllers.js';

const validBody = {
  category: 'bug' as const,
  levelId: 1,
  message: 'Bread keeps falling into the water near the nest.',
  email: 'player@example.com',
};

describe('POST /api/v1/feedback', () => {
  it('creates feedback, notifies mail, and returns 201', async () => {
    const create = vi.fn(
      async (input: CreateFeedbackInput): Promise<FeedbackRecord> => ({
        id: 'fb-1',
        category: input.category,
        levelId: input.levelId,
        message: input.message,
        email: input.email,
        createdAt: new Date(),
      }),
    );
    const notify = vi.fn(async () => undefined);

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        { repository: { create }, mailService: { notify } },
      ),
    });

    const res = await request(app).post('/api/v1/feedback').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'fb-1' });
    expect(create).toHaveBeenCalledWith({
      category: 'bug',
      levelId: 1,
      message: validBody.message,
      email: 'player@example.com',
    });
    expect(notify).toHaveBeenCalledOnce();
  });

  it('returns 201 even when SendGrid notify fails', async () => {
    const create = vi.fn(
      async (input: CreateFeedbackInput): Promise<FeedbackRecord> => ({
        id: 'fb-2',
        category: input.category,
        message: input.message,
        createdAt: new Date(),
      }),
    );
    const notify = vi.fn(async () => {
      throw new Error('sendgrid down');
    });

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        { repository: { create }, mailService: { notify } },
      ),
    });

    const res = await request(app)
      .post('/api/v1/feedback')
      .send({
        category: 'suggestion',
        message: 'Please add more bread varieties next update.',
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'fb-2' });
    expect(create).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledOnce();
  });

  it('honeypot filled returns 201 without persisting or mailing', async () => {
    const create = vi.fn();
    const notify = vi.fn();

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        { repository: { create }, mailService: { notify } },
      ),
    });

    const res = await request(app)
      .post('/api/v1/feedback')
      .send({ ...validBody, website: 'http://spam.example' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'accepted' });
    expect(create).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid payload', async () => {
    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(),
    });

    const res = await request(app)
      .post('/api/v1/feedback')
      .send({ category: 'bug', message: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 429 when rate limited', async () => {
    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(),
    });

    let lastStatus = 0;
    for (let i = 0; i < 6; i += 1) {
      const res = await request(app)
        .post('/api/v1/feedback')
        .send({
          category: 'other',
          message: `Rate limit probe message number ${i} is long enough.`,
        });
      lastStatus = res.status;
      if (res.status === 429) {
        expect(res.body).toEqual({
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests',
          },
        });
        return;
      }
    }

    expect(lastStatus).toBe(429);
  });
});
