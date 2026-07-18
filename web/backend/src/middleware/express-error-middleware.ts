import type { ErrorRequestHandler } from 'express';

import type { ErrorHandler } from '../errors/error-handler.js';

export function createExpressErrorMiddleware(
  errorHandler: ErrorHandler,
): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    const handled = errorHandler.handle(err);
    res.status(handled.status).json(handled.body);
  };
}
