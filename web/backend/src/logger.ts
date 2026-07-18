import pino, { type Logger } from 'pino';

export function createLogger(nodeEnv: string): Logger {
  return pino({
    level: nodeEnv === 'production' ? 'info' : 'debug',
  });
}
