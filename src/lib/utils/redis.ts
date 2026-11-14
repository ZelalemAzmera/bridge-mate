import { env } from '@/lib/env';

export interface SortedSetEntry {
  member: string;
  score: number;
}

export interface IRedisClient {
  get<T = any>(key: string): Promise<T | null>;
  set(
    key: string,
    value: any,
    options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean }
  ): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
  exists(...keys: string[]): Promise<number>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  keys(pattern?: string): Promise<string[]>;
  lpush(key: string, ...elements: any[]): Promise<number>;
  rpop<T = any>(key: string): Promise<T | null>;
  lrange<T = any>(key: string, start: number, stop: number): Promise<T[]>;
  llen(key: string): Promise<number>;
  zadd(
    key: string,
    arg1: number | { score: number; member: string } | Array<{ score: number; member: string }>,
    arg2?: string
  ): Promise<number>;
  zrange<T = string>(
    key: string,
    start: number,
    stop: number,
    options?: { withScores?: boolean; rev?: boolean }
  ): Promise<T[]>;
  zrank(key: string, member: string): Promise<number | null>;
  zrevrank(key: string, member: string): Promise<number | null>;
  zrem(key: string, ...members: string[]): Promise<number>;
  zcard(key: string): Promise<number>;
  zscore(key: string, member: string): Promise<number | null>;
  flushall(): Promise<'OK'>;
  flushdb(): Promise<'OK'>;
}

interface StoredValue {
  value: any;
  expiresAt: number | null;
}

export class InMemoryRedis implements IRedisClient {
  private static instance: InMemoryRedis;
  private store = new Map<string, StoredValue>();
  private lists = new Map<string, any[]>();
  private sortedSets = new Map<string, Map<string, number>>();

  static getInstance(): InMemoryRedis {
    if (!InMemoryRedis.instance) {
      InMemoryRedis.instance = new InMemoryRedis();
    }
    return InMemoryRedis.instance;
  }

  private isExpired(item: StoredValue): boolean {
    if (item.expiresAt === null) return false;
    return Date.now() > item.expiresAt;
  }

  private checkExpiry(key: string): boolean {
    const item = this.store.get(key);
    if (!item) return false;
    if (this.isExpired(item)) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.checkExpiry(key)) {
      return null;
    }
    const item = this.store.get(key);
    if (!item) return null;
    return item.value as T;
  }

  async set(
    key: string,
    value: any,
    options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean }
  ): Promise<string | null> {
    const exists = this.checkExpiry(key);
    if (options?.nx && exists) return null;
    if (options?.xx && !exists) return null;

    let expiresAt: number | null = null;
    if (options?.ex !== undefined) {
      expiresAt = Date.now() + options.ex * 1000;
    } else if (options?.px !== undefined) {
      expiresAt = Date.now() + options.px;
    }

    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      const removedStore = this.store.delete(key);
      const removedList = this.lists.delete(key);
      const removedZset = this.sortedSets.delete(key);
      if (removedStore || removedList || removedZset) {
        deleted++;
      }
    }
    return deleted;
  }

  async exists(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.checkExpiry(key) || this.lists.has(key) || this.sortedSets.has(key)) {
        count++;
      }
    }
    return count;
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) ?? 0;
    const next = Number(current) + 1;
    await this.set(key, next);
    return next;
  }

  async decr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) ?? 0;
    const next = Number(current) - 1;
    await this.set(key, next);
    return next;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (!item) return 0;
    item.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    if (!this.checkExpiry(key)) {
      return -2;
    }
    const item = this.store.get(key);
    if (!item || item.expiresAt === null) {
      return -1;
    }
    const remainingSec = Math.ceil((item.expiresAt - Date.now()) / 1000);
    return Math.max(0, remainingSec);
  }

  async keys(pattern = '*'): Promise<string[]> {
    const allKeys = new Set<string>();
    for (const [key, item] of this.store.entries()) {
      if (!this.isExpired(item)) {
        allKeys.add(key);
      }
    }
    for (const key of this.lists.keys()) {
      allKeys.add(key);
    }
    for (const key of this.sortedSets.keys()) {
      allKeys.add(key);
    }

    if (pattern === '*') {
      return Array.from(allKeys);
    }

    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return Array.from(allKeys).filter((k) => regex.test(k));
  }

  // Lists (Queue operations)
  async lpush(key: string, ...elements: any[]): Promise<number> {
    const list = this.lists.get(key) || [];
    list.unshift(...elements);
    this.lists.set(key, list);
    return list.length;
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    const list = this.lists.get(key);
    if (!list || list.length === 0) return null;
    return (list.pop() as T) ?? null;
  }

  async lrange<T = any>(key: string, start: number, stop: number): Promise<T[]> {
    const list = this.lists.get(key) || [];
    if (stop === -1) return list.slice(start) as T[];
    return list.slice(start, stop + 1) as T[];
  }

  async llen(key: string): Promise<number> {
    const list = this.lists.get(key) || [];
    return list.length;
  }

  // Sorted Sets (FIFO / Priority queue operations)
  async zadd(
    key: string,
    arg1: number | { score: number; member: string } | Array<{ score: number; member: string }>,
    arg2?: string
  ): Promise<number> {
    let zset = this.sortedSets.get(key);
    if (!zset) {
      zset = new Map<string, number>();
      this.sortedSets.set(key, zset);
    }

    let addedCount = 0;

    if (typeof arg1 === 'number' && typeof arg2 === 'string') {
      if (!zset.has(arg2)) addedCount++;
      zset.set(arg2, arg1);
    } else if (Array.isArray(arg1)) {
      for (const item of arg1) {
        if (!zset.has(item.member)) addedCount++;
        zset.set(item.member, item.score);
      }
    } else if (typeof arg1 === 'object' && arg1 !== null && 'score' in arg1 && 'member' in arg1) {
      if (!zset.has(arg1.member)) addedCount++;
      zset.set(arg1.member, arg1.score);
    }

    return addedCount;
  }

  async zrange<T = string>(
    key: string,
    start: number,
    stop: number,
    options?: { withScores?: boolean; rev?: boolean }
  ): Promise<T[]> {
    const zset = this.sortedSets.get(key);
    if (!zset || zset.size === 0) {
      return [];
    }

    const entries: SortedSetEntry[] = [];
    for (const [member, score] of zset.entries()) {
      entries.push({ member, score });
    }

    entries.sort((a, b) => {
      if (a.score !== b.score) {
        return options?.rev ? b.score - a.score : a.score - b.score;
      }
      return a.member.localeCompare(b.member);
    });

    const total = entries.length;
    let normalizedStart = start < 0 ? total + start : start;
    let normalizedStop = stop < 0 ? total + stop : stop;

    if (normalizedStart < 0) normalizedStart = 0;
    if (normalizedStop >= total) normalizedStop = total - 1;

    if (normalizedStart > normalizedStop || normalizedStart >= total) {
      return [];
    }

    const sliced = entries.slice(normalizedStart, normalizedStop + 1);

    if (options?.withScores) {
      const result: any[] = [];
      for (const item of sliced) {
        result.push(item.member, item.score);
      }
      return result as T[];
    }

    return sliced.map((item) => item.member) as unknown as T[];
  }

  async zrank(key: string, member: string): Promise<number | null> {
    const zset = this.sortedSets.get(key);
    if (!zset || !zset.has(member)) return null;

    const entries: SortedSetEntry[] = [];
    for (const [m, s] of zset.entries()) {
      entries.push({ member: m, score: s });
    }
    entries.sort((a, b) => (a.score !== b.score ? a.score - b.score : a.member.localeCompare(b.member)));

    const idx = entries.findIndex((item) => item.member === member);
    return idx >= 0 ? idx : null;
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    const zset = this.sortedSets.get(key);
    if (!zset || !zset.has(member)) return null;

    const entries: SortedSetEntry[] = [];
    for (const [m, s] of zset.entries()) {
      entries.push({ member: m, score: s });
    }
    entries.sort((a, b) => (a.score !== b.score ? b.score - a.score : b.member.localeCompare(a.member)));

    const idx = entries.findIndex((item) => item.member === member);
    return idx >= 0 ? idx : null;
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    const zset = this.sortedSets.get(key);
    if (!zset) return 0;

    let removed = 0;
    for (const m of members) {
      if (zset.delete(m)) {
        removed++;
      }
    }
    return removed;
  }

  async zcard(key: string): Promise<number> {
    const zset = this.sortedSets.get(key);
    return zset ? zset.size : 0;
  }

  async zscore(key: string, member: string): Promise<number | null> {
    const zset = this.sortedSets.get(key);
    if (!zset || !zset.has(member)) return null;
    return zset.get(member) ?? null;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    this.lists.clear();
    this.sortedSets.clear();
    return 'OK';
  }

  async flushdb(): Promise<'OK'> {
    return this.flushall();
  }
}

// Global in-memory singleton
let inMemoryInstance: InMemoryRedis | null = null;

export function getInMemoryRedis(): InMemoryRedis {
  if (!inMemoryInstance) {
    inMemoryInstance = InMemoryRedis.getInstance();
  }
  return inMemoryInstance;
}

export function createRedisClient(): IRedisClient {
  if (env.isMockRedis) {
    return getInMemoryRedis();
  }

  try {
    // Dynamic import to prevent bundler errors if @upstash/redis is not used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Redis } = require('@upstash/redis');
    return new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    }) as unknown as IRedisClient;
  } catch (err) {
    console.warn('[Redis] Failed to initialize live @upstash/redis client. Falling back to InMemoryRedis.', err);
    return getInMemoryRedis();
  }
}

export const redis: IRedisClient = createRedisClient();

export function getRedisClient(): IRedisClient {
  return redis;
}

export const getRedis = getRedisClient;

