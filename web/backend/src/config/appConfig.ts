import 'dotenv/config';

import { z } from 'zod';

const resendSchema = z.object({
  apiKey: z.string().min(1),
  fromEmail: z.string().email(),
  notifyEmail: z.string().email(),
});

const voteSchema = z.object({
  ipHashSecret: z.string().min(16),
  windowMs: z.number().int().positive(),
  maxVotesPerWindow: z.number().int().positive(),
});

const storeRatingSchema = z.object({
  appId: z.string().min(1),
  accessToken: z.string().min(1),
  docId: z.string().min(1),
  cacheTtlMs: z.number().int().positive(),
  endpoint: z.string().url(),
});

const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']),
  port: z.number().int().positive(),
  corsOrigin: z.string().min(1),
  mongoUri: z.string().min(1),
  publicAssetBaseUrl: z.string().url(),
  resend: resendSchema,
  vote: voteSchema,
  storeRating: storeRatingSchema,
});

export type AppConfig = z.infer<typeof appConfigSchema>;

function readRawConfig() {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3002),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    mongoUri: process.env.MONGO_URI ?? '',
    publicAssetBaseUrl:
      process.env.PUBLIC_ASSET_BASE_URL ?? 'http://localhost:5173',
    resend: {
      apiKey: process.env.RESEND_API_KEY ?? '',
      fromEmail: process.env.RESEND_FROM_EMAIL ?? '',
      notifyEmail: process.env.FEEDBACK_NOTIFY_EMAIL ?? '',
    },
    vote: {
      ipHashSecret: process.env.VOTE_IP_HASH_SECRET ?? '',
      windowMs: 60_000,
      maxVotesPerWindow: 5,
    },
    storeRating: {
      appId: process.env.META_APP_ID ?? '',
      accessToken: process.env.OCULUS_GRAPH_ACCESS_TOKEN ?? '',
      docId: process.env.OCULUS_GRAPH_DOC_ID ?? '',
      cacheTtlMs: Number(process.env.STORE_RATING_CACHE_TTL_MS ?? 21_600_000),
      endpoint:
        process.env.OCULUS_GRAPH_ENDPOINT ?? 'https://graph.oculus.com/graphql',
    },
  };
}

export function loadConfig(): AppConfig {
  const parsed = appConfigSchema.safeParse(readRawConfig());
  if (!parsed.success) {
    console.error('Invalid config', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
}
