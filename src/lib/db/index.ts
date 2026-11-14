// ==============================================================================
// File: src/lib/db/index.ts
// BridgeMate Database Client & Repository Layer Gateway
// Seamlessly routes queries to Live PostgreSQL (Neon) or In-Memory Fallback
// ==============================================================================

import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import type { IDatabaseRepository } from './types';
import { MemoryDatabaseRepository, getMemoryRepository } from './memory-repo';
import { PostgresDatabaseRepository } from './postgres-repo';

// Re-export all schema components and types
export * from './schema';
export * from './types';
export { MemoryDatabaseRepository, getMemoryRepository };

let _drizzleInstance: NeonHttpDatabase<typeof schema> | null = null;
let _activeRepository: IDatabaseRepository | null = null;

/**
 * Determines whether a valid PostgreSQL connection string is supplied.
 * Excludes mock keywords, empty strings, and template placeholders.
 */
export function isLiveDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed === '' ||
    trimmed === 'mock' ||
    trimmed === 'test' ||
    trimmed.startsWith('mock://') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('username:password@ep-placeholder') ||
    trimmed.includes('sample')
  ) {
    return false;
  }
  return true;
}

/**
 * Returns the raw Drizzle ORM client when a live database is configured,
 * or null if operating in fallback mock mode.
 */
export function getDb(): NeonHttpDatabase<typeof schema> | null {
  if (!isLiveDatabaseConfigured()) {
    return null;
  }

  if (!_drizzleInstance) {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      _drizzleInstance = drizzle(sql, { schema });
    } catch (err) {
      console.warn('[BridgeMate DB] Failed to initialize Neon Drizzle instance:', err);
      return null;
    }
  }

  return _drizzleInstance;
}

/**
 * Primary repository entrypoint. Returns either the live Postgres repository
 * or the in-memory repository depending on credentials.
 */
export function getRepository(): IDatabaseRepository {
  if (_activeRepository) {
    return _activeRepository;
  }

  if (isLiveDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        _activeRepository = new PostgresDatabaseRepository(db);
        return _activeRepository;
      }
    } catch (err) {
      console.warn(
        '[BridgeMate DB] Live database connection initialization failed. Falling back to in-memory repository.',
        err
      );
    }
  }

  _activeRepository = getMemoryRepository();
  return _activeRepository;
}

/**
 * Alias for getRepository() to ensure cross-module compatibility.
 */
export const getDatabaseRepository = getRepository;

/**
 * Explicitly overrides the active repository.
 * Crucial for testing and resetting repository state across test suites.
 */
export function setRepository(repo: IDatabaseRepository | null): void {
  _activeRepository = repo;
}

