import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { AppError } from '../../errors/app-error.js';

export type VoteGuardConfig = {
  ipHashSecret: string;
  windowMs: number;
  maxVotesPerWindow: number;
};

type WindowEntry = {
  timestamps: number[];
};

export class VoteGuard {
  private readonly windows = new Map<string, WindowEntry>();

  constructor(private readonly config: VoteGuardConfig) {}

  generateVoterToken(): string {
    return randomUUID();
  }

  hashIp(ip: string): string {
    return createHmac('sha256', this.config.ipHashSecret)
      .update(ip)
      .digest('hex');
  }

  /**
   * Sliding-window rate limit keyed by hashed IP (never raw IP).
   * Throws RATE_LIMITED (429) when exceeded.
   */
  assertWithinRateLimit(ipHash: string, now = Date.now()): void {
    const entry = this.windows.get(ipHash) ?? { timestamps: [] };
    const cutoff = now - this.config.windowMs;
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

    if (entry.timestamps.length >= this.config.maxVotesPerWindow) {
      this.windows.set(ipHash, entry);
      throw new AppError('RATE_LIMITED', 'Too many votes', 429);
    }

    entry.timestamps.push(now);
    this.windows.set(ipHash, entry);
  }

  /** Test helper — compare hashes without leaking timing. */
  static hashesEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }
}
