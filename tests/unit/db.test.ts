import { describe, it, expect, beforeEach } from 'vitest';
import { getRepository, isLiveDatabaseConfigured } from '@/lib/db';

describe('Database Gateway (src/lib/db/index.ts)', () => {
  it('returns false for isLiveDatabaseConfigured in default offline mode', () => {
    expect(isLiveDatabaseConfigured()).toBe(false);
  });

  it('provides singleton database repository', async () => {
    const repo = getRepository();
    expect(repo).toBeDefined();
    expect(repo.users).toBeDefined();
    expect(repo.knowledge).toBeDefined();
    expect(repo.conversations).toBeDefined();
    expect(repo.opportunities).toBeDefined();
    expect(repo.accommodations).toBeDefined();
    expect(repo.support).toBeDefined();
    expect(repo.subscriptions).toBeDefined();
  });
});

