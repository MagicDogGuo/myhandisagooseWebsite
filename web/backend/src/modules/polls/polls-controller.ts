import type { Request, Response } from 'express';

import type { AppConfig } from '../../config/appConfig.js';
import { AppError } from '../../errors/app-error.js';
import { VOTER_TOKEN_COOKIE, voteBodySchema } from './polls-schema.js';
import type { PollsService } from './polls-service.js';
import type { VoteGuard } from './vote-guard.js';

function readClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || req.ip || '0.0.0.0';
  }
  return req.ip || '0.0.0.0';
}

function cookieOptions(nodeEnv: AppConfig['nodeEnv']) {
  const isProd = nodeEnv === 'production';
  return {
    httpOnly: true,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProd,
    path: '/',
    maxAge: 365 * 24 * 60 * 60 * 1000,
  };
}

export class PollsController {
  constructor(
    private readonly service: PollsService,
    private readonly voteGuard: VoteGuard,
    private readonly nodeEnv: AppConfig['nodeEnv'],
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    const voterToken =
      typeof req.cookies?.[VOTER_TOKEN_COOKIE] === 'string'
        ? req.cookies[VOTER_TOKEN_COOKIE]
        : undefined;

    const polls = await this.service.listPolls(voterToken);
    res.status(200).json({ polls });
  }

  async vote(req: Request, res: Response): Promise<void> {
    const pollId =
      typeof req.params.pollId === 'string' ? req.params.pollId : '';
    if (!pollId) {
      throw new AppError('VALIDATION_ERROR', 'Missing pollId', 400);
    }

    const parsed = voteBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid vote payload',
        400,
        true,
        parsed.error.flatten(),
      );
    }

    let voterToken =
      typeof req.cookies?.[VOTER_TOKEN_COOKIE] === 'string'
        ? req.cookies[VOTER_TOKEN_COOKIE]
        : undefined;
    let issuedNewToken = false;

    if (!voterToken) {
      voterToken = this.voteGuard.generateVoterToken();
      issuedNewToken = true;
    }

    const poll = await this.service.castVote({
      pollId,
      optionId: parsed.data.optionId,
      voterToken,
      clientIp: readClientIp(req),
    });

    if (issuedNewToken) {
      res.cookie(VOTER_TOKEN_COOKIE, voterToken, cookieOptions(this.nodeEnv));
    }

    res.status(200).json({ poll });
  }
}
