import type { AppConfig } from '../config/appConfig.js';

export function createTestConfig(
  overrides: Partial<AppConfig> = {},
): AppConfig {
  return {
    nodeEnv: 'test',
    port: 3001,
    corsOrigin: 'http://localhost:5173',
    mongoUri: 'mongodb://127.0.0.1:27017/goose_web_test',
    publicAssetBaseUrl: 'http://localhost:5173',
    resend: {
      apiKey: 'test-key',
      fromEmail: 'noreply@example.com',
      notifyEmail: 'dev@example.com',
    },
    vote: {
      ipHashSecret: 'test-ip-hash-secret',
      windowMs: 60_000,
      maxVotesPerWindow: 5,
    },
    storeRating: {
      appId: 'test-app',
      accessToken: 'test-token',
      docId: 'test-doc',
      cacheTtlMs: 21_600_000,
      endpoint: 'https://graph.oculus.com/graphql',
    },
    ...overrides,
  };
}
