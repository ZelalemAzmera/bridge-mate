import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRedis } from '@/lib/utils/redis';

describe('InMemoryRedis (src/lib/utils/redis.ts)', () => {
  let redis: InMemoryRedis;

  beforeEach(() => {
    redis = new InMemoryRedis();
  });

  describe('Key-Value Operations', () => {
    it('sets and gets simple string values', async () => {
      const res = await redis.set('greet', 'ሰላም');
      expect(res).toBe('OK');

      const val = await redis.get<string>('greet');
      expect(val).toBe('ሰላም');
    });

    it('stores and retrieves complex JSON objects', async () => {
      const packet = {
        sessionId: 'sess_123',
        goal: 'Apply for accountant position',
        disclosedNeeds: ['screen reader', 'high contrast'],
      };

      await redis.set('packet:sess_123', packet);
      const retrieved = await redis.get<typeof packet>('packet:sess_123');

      expect(retrieved).toEqual(packet);
      expect(retrieved?.goal).toBe('Apply for accountant position');
    });

    it('deletes keys and verifies existence', async () => {
      await redis.set('k1', 'val1');
      await redis.set('k2', 'val2');

      expect(await redis.exists('k1', 'k2', 'k3')).toBe(2);

      const deleted = await redis.del('k1');
      expect(deleted).toBe(1);
      expect(await redis.get('k1')).toBeNull();
      expect(await redis.exists('k1')).toBe(0);
    });

    it('increments and decrements numeric counters', async () => {
      expect(await redis.incr('view_count')).toBe(1);
      expect(await redis.incr('view_count')).toBe(2);
      expect(await redis.decr('view_count')).toBe(1);
    });
  });

  describe('TTL and Expiration', () => {
    it('sets TTL and returns remaining seconds', async () => {
      await redis.set('temp', 'data', { ex: 60 });
      const ttl = await redis.ttl('temp');

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60);
    });

    it('returns -1 for persistent keys and -2 for non-existent keys', async () => {
      await redis.set('persist', 'infinite');
      expect(await redis.ttl('persist')).toBe(-1);
      expect(await redis.ttl('nonexistent')).toBe(-2);
    });

    it('expires keys automatically when TTL lapses', async () => {
      await redis.set('quick', 'expire_me', { px: 10 }); // 10 milliseconds
      expect(await redis.get('quick')).toBe('expire_me');

      // Wait 30ms to exceed TTL
      await new Promise((r) => setTimeout(r, 30));

      expect(await redis.get('quick')).toBeNull();
      expect(await redis.ttl('quick')).toBe(-2);
    });
  });

  describe('Sorted Set (ZSET) Operations for Support Queue', () => {
    it('adds members with scores and maintains FIFO order', async () => {
      await redis.zadd('support:queue', 100, 'session_alpha');
      await redis.zadd('support:queue', 200, 'session_beta');
      await redis.zadd('support:queue', 50, 'session_first');

      expect(await redis.zcard('support:queue')).toBe(3);

      // Slicing 0 to -1 returns all items ordered by score ASC
      const queue = await redis.zrange('support:queue', 0, -1);
      expect(queue).toEqual(['session_first', 'session_alpha', 'session_beta']);
    });

    it('computes ranks correctly (0-based queue position)', async () => {
      await redis.zadd('queue', 10, 'user_a');
      await redis.zadd('queue', 20, 'user_b');
      await redis.zadd('queue', 30, 'user_c');

      expect(await redis.zrank('queue', 'user_a')).toBe(0);
      expect(await redis.zrank('queue', 'user_b')).toBe(1);
      expect(await redis.zrank('queue', 'user_c')).toBe(2);
      expect(await redis.zrank('queue', 'unknown')).toBeNull();

      // Revrank (descending)
      expect(await redis.zrevrank('queue', 'user_c')).toBe(0);
    });

    it('removes members and checks scores', async () => {
      await redis.zadd('queue', 150, 'session_x');
      expect(await redis.zscore('queue', 'session_x')).toBe(150);

      const removed = await redis.zrem('queue', 'session_x');
      expect(removed).toBe(1);
      expect(await redis.zscore('queue', 'session_x')).toBeNull();
      expect(await redis.zcard('queue')).toBe(0);
    });

    it('supports array payload for zadd', async () => {
      const added = await redis.zadd('batch_queue', [
        { score: 1, member: 'item_1' },
        { score: 2, member: 'item_2' },
      ]);
      expect(added).toBe(2);
      expect(await redis.zcard('batch_queue')).toBe(2);
    });

    it('flushes all keys and sorted sets', async () => {
      await redis.set('k', 'v');
      await redis.zadd('z', 1, 'm');

      await redis.flushall();

      expect(await redis.get('k')).toBeNull();
      expect(await redis.zcard('z')).toBe(0);
    });
  });
});

