import { z } from 'zod';

export const envSchema = z.object({
  // Core Node & Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_DEFAULT_LANGUAGE: z
    .enum(['am', 'en'])
    .catch('am')
    .default('am'),

  // Persistence (PostgreSQL & pgvector)
  DATABASE_URL: z.string().optional(),
  USE_MEMORY_DB: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true' || val === '1'),

  // Authentication (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().default('mock'),
  CLERK_SECRET_KEY: z.string().default('mock'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/learn'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/learn'),

  // Cache & Ephemeral State (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  USE_MEMORY_REDIS: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true' || val === '1'),

  // AI Providers (Groq / Gemini / OpenAI / Synthetic Mock)
  GROQ_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  DEFAULT_AI_PROVIDER: z.enum(['gemini', 'openai', 'groq', 'mock']).default('mock'),
  AI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),

  // Real-Time Support Messaging (Ably)
  NEXT_PUBLIC_ABLY_PUBLISHABLE_KEY: z.string().optional(),
  ABLY_API_KEY: z.string().optional(),
  USE_MOCK_ABLY: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true' || val === '1'),

  // WebRTC Video & Screen Sharing (Daily.co)
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN: z.string().optional(),

  // Storage (Vercel Blob)
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Notifications (SMS Gateways: Send.et, Africa's Talking, Twilio, Mock)
  SMS_PROVIDER: z
    .enum(['send.et', 'sendet', 'send_et', 'africas_talking', 'africastalking', 'twilio', 'mock', 'sandbox'])
    .default('mock'),
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().default('BridgeMate'),
  SENDET_API_KEY: z.string().optional(),
  SEND_ET_API_KEY: z.string().optional(),
  SEND_ET_SENDER_ID: z.string().optional(),
  AFRICASTALKING_USERNAME: z.string().optional(),
  AFRICASTALKING_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export type ValidatedEnv = Env & {
  isMockAuth: boolean;
  isMockDb: boolean;
  isMockRedis: boolean;
  isMockAi: boolean;
  isMockAbly: boolean;
};

export function validateEnv(rawEnv: Record<string, string | undefined> = process.env): ValidatedEnv {
  const result = envSchema.safeParse(rawEnv);

  let data: Env;
  if (!result.success) {
    console.warn('[Env] Some environment variables were invalid or missing. Applying defaults:', result.error.format());
    data = envSchema.parse({});
  } else {
    data = result.data;
  }

  // Derive mock mode indicators
  const clerkPubKey = data.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecret = data.CLERK_SECRET_KEY;
  const isMockAuth =
    !clerkPubKey ||
    clerkPubKey === 'mock' ||
    clerkPubKey.startsWith('pk_test_sample') ||
    clerkPubKey.includes('sample') ||
    !clerkSecret ||
    clerkSecret === 'mock' ||
    clerkSecret.startsWith('sk_test_sample') ||
    clerkSecret.includes('sample') ||
    (!clerkPubKey.startsWith('pk_test_') && !clerkPubKey.startsWith('pk_live_'));

  const dbUrl = data.DATABASE_URL;
  const isMockDb =
    data.USE_MEMORY_DB === true ||
    !dbUrl ||
    dbUrl === 'mock' ||
    dbUrl.includes('sample-pooler') ||
    dbUrl.includes('sample') ||
    dbUrl.includes('placeholder');

  const redisUrl = data.UPSTASH_REDIS_REST_URL;
  const redisToken = data.UPSTASH_REDIS_REST_TOKEN;
  const isMockRedis =
    data.USE_MEMORY_REDIS === true ||
    !redisUrl ||
    !redisToken ||
    redisUrl === 'mock' ||
    redisUrl.includes('sample-redis') ||
    redisUrl.includes('sample') ||
    redisToken === 'mock' ||
    redisToken.startsWith('sample_');

  const isMockAi =
    data.DEFAULT_AI_PROVIDER === 'mock' ||
    (!data.GOOGLE_GENERATIVE_AI_API_KEY && !data.OPENAI_API_KEY);

  const ablyKey = data.ABLY_API_KEY;
  const isMockAbly =
    data.USE_MOCK_ABLY === true ||
    !ablyKey ||
    ablyKey === 'mock' ||
    ablyKey.includes('sample');

  return {
    ...data,
    isMockAuth,
    isMockDb,
    isMockRedis,
    isMockAi,
    isMockAbly,
  };
}

export const env: ValidatedEnv = validateEnv();
