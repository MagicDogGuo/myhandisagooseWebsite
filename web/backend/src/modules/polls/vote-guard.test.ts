import { describe, expect, it } from 'vitest';

import { AppError } from '../../errors/app-error.js';
import { VoteGuard } from './vote-guard.js';

const config = {
  ipHashSecret: 'test-ip-hash-secret',
  windowMs: 60_000,
  maxVotesPerWindow: 3,
};

describe('VoteGuard', () => {
  it('hashes IP with HMAC and never returns the raw IP', () => {
    const guard = new VoteGuard(config);
    const hash = guard.hashIp('203.0.113.10');

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain('203.0.113.10');
    expect(guard.hashIp('203.0.113.10')).toBe(hash);
    expect(guard.hashIp('203.0.113.11')).not.toBe(hash);
  });

  it('generates unique voter tokens', () => {
    const guard = new VoteGuard(config);
    const a = guard.generateVoterToken();
    const b = guard.generateVoterToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('allows up to maxVotesPerWindow then throws RATE_LIMITED', () => {
    const guard = new VoteGuard(config);
    const ipHash = guard.hashIp('198.51.100.1');
    const now = 1_000_000;

    guard.assertWithinRateLimit(ipHash, now);
    guard.assertWithinRateLimit(ipHash, now + 1);
    guard.assertWithinRateLimit(ipHash, now + 2);

    expect(() => guard.assertWithinRateLimit(ipHash, now + 3)).toThrow(AppError);
    try {
      guard.assertWithinRateLimit(ipHash, now + 4);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe('RATE_LIMITED');
      expect((err as AppError).httpStatus).toBe(429);
    }
  });

  it('resets after the window elapses', () => {
    const guard = new VoteGuard(config);
    const ipHash = guard.hashIp('198.51.100.2');
    const now = 2_000_000;

    guard.assertWithinRateLimit(ipHash, now);
    guard.assertWithinRateLimit(ipHash, now + 1);
    guard.assertWithinRateLimit(ipHash, now + 2);

    expect(() =>
      guard.assertWithinRateLimit(ipHash, now + config.windowMs + 1),
    ).not.toThrow();
  });
});
