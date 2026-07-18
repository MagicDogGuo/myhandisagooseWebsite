import type { Logger } from 'pino';

import { AppError } from './app-error.js';

export type ErrorResponseBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type HandledError = {
  status: number;
  body: ErrorResponseBody;
  shouldCrash: boolean;
};

export function createErrorHandler(logger: Logger) {
  return {
    handle(err: unknown): HandledError {
      if (err instanceof AppError) {
        if (!err.isOperational) {
          logger.error({ err, code: err.code }, 'non-operational AppError');
        } else {
          logger.warn({ code: err.code, message: err.message }, 'operational error');
        }

        return {
          status: err.httpStatus,
          body: {
            error: {
              code: err.code,
              message: err.message,
              ...(err.details !== undefined ? { details: err.details } : {}),
            },
          },
          shouldCrash: !err.isOperational,
        };
      }

      logger.error({ err }, 'unhandled error');
      return {
        status: 500,
        body: {
          error: {
            code: 'INTERNAL',
            message: 'Internal server error',
          },
        },
        shouldCrash: true,
      };
    },
  };
}

export type ErrorHandler = ReturnType<typeof createErrorHandler>;
