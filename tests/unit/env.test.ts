import { describe, it, expect } from 'vitest';
import { validateEnv } from '@/lib/env';

describe('Environment Validator (src/lib/env.ts)', () => {
  it('applies safe defaults and enables all mock flags when env is empty', () => {
    const env = validateEnv({});

    expect(env.NODE_ENV).toBe('development');
    expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
    expect(env.NEXT_PUBLIC_DEFAULT_LANGUAGE).toBe('am');
    expect(env.isMockAuth).toBe(true);
    expect(env.isMockDb).toBe(true);
    expect(env.isMockRedis).toBe(true);
    expect(env.isMockAi).toBe(true);
    expect(env.isMockAbly).toBe(true);
  });

  it('detects live credentials and turns off mock flags', () => {
    const env = validateEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_URL: 'https://bridgemate.et',
      DATABASE_URL: 'postgresql://real_user:secret@ep-live.us-east-2.aws.neon.tech/prod?sslmode=require',
      USE_MEMORY_DB: 'false',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_live_clerk_key_1234567890',
      CLERK_SECRET_KEY: 'sk_test_live_clerk_secret_1234567890',
      UPSTASH_REDIS_REST_URL: 'https://actual-redis-instance.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'actual_secret_token_12345',
      USE_MEMORY_REDIS: 'false',
      GOOGLE_GENERATIVE_AI_API_KEY: 'AIzaSyActualGoogleApiKey',
      DEFAULT_AI_PROVIDER: 'gemini',
      ABLY_API_KEY: 'actual_key:actual_secret',
      USE_MOCK_ABLY: 'false',
    });

    expect(env.isMockAuth).toBe(false);
    expect(env.isMockDb).toBe(false);
    expect(env.isMockRedis).toBe(false);
    expect(env.isMockAi).toBe(false);
    expect(env.isMockAbly).toBe(false);
  });

  it('identifies placeholder / sample credentials as mock mode', () => {
    const env = validateEnv({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_sample_clerk_key',
      CLERK_SECRET_KEY: 'sk_test_sample_clerk_secret',
      UPSTASH_REDIS_REST_URL: 'https://sample-redis.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'sample_upstash_token',
      DATABASE_URL: 'postgresql://user:pass@ep-sample-pooler.us-east-2.aws.neon.tech/bridgemate',
    });

    expect(env.isMockAuth).toBe(true);
    expect(env.isMockDb).toBe(true);
    expect(env.isMockRedis).toBe(true);
  });

  it('falls back to "am" when an invalid language code is passed', () => {
    const env = validateEnv({
      NEXT_PUBLIC_DEFAULT_LANGUAGE: 'fr' as any,
    });

    expect(env.NEXT_PUBLIC_DEFAULT_LANGUAGE).toBe('am');
  });

  it('correctly transforms USE_MEMORY_DB and USE_MEMORY_REDIS string flags', () => {
    const envTrue = validateEnv({
      USE_MEMORY_DB: 'true',
      USE_MEMORY_REDIS: 'true',
    });
    expect(envTrue.USE_MEMORY_DB).toBe(true);
    expect(envTrue.USE_MEMORY_REDIS).toBe(true);

    const envFalse = validateEnv({
      USE_MEMORY_DB: 'false',
      USE_MEMORY_REDIS: 'false',
    });
    expect(envFalse.USE_MEMORY_DB).toBe(false);
    expect(envFalse.USE_MEMORY_REDIS).toBe(false);
  });
});

