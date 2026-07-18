import { rateLimit } from 'express-rate-limit';

import { AppError } from '../errors/app-error.js';

const FEEDBACK_WINDOW_MS = 15 * 60 * 1000;
const FEEDBACK_MAX_PER_WINDOW = 5;

export const feedbackRateLimiter = rateLimit({
  windowMs: FEEDBACK_WINDOW_MS,
  max: FEEDBACK_MAX_PER_WINDOW,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('RATE_LIMITED', 'Too many requests', 429));
  },
});
