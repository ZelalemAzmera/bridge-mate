import { getRepository } from '@/lib/db';
import type { KnowledgeChunkWithSource } from '@/lib/db/types';
import { env } from '@/lib/env';
import { seedDatabase } from '@/lib/db/seed';

export interface RetrievalResult {
  chunks: KnowledgeChunkWithSource[];
  contextText: string;
}

/**
 * Creates a deterministic 1536-dimensional pseudo-embedding vector
 * from a query string when external embedding APIs are not configured.
 */
function createOfflineEmbedding(query: string, dimensions = 1536): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = query.toLowerCase().trim();

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (charCode * (i + 1) * 31) % dimensions;
    vector[index] = (vector[index] + 1) % 10;
  }

  // Normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

/**
 * Generates an embedding for a query, using live OpenAI/Gemini APIs when keys are present,
 * or the offline vector synthesizer when running without external API keys.
 */
export async function getQueryEmbedding(query: string): Promise<number[]> {
  if (env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.data[0].embedding;
      }
    } catch {
      // Fallback to offline embedding on error
    }
  }

  return createOfflineEmbedding(query);
}

/**
 * Retrieves the top relevant knowledge chunks for a query from the database.
 * Automatically ensures baseline curriculum data is seeded if the repository is uninitialized.
 */
export async function retrieveRelevantChunks(
  query: string,
  threshold = 0.5,
  limit = 4
): Promise<RetrievalResult> {
  const repo = getRepository();
  const embedding = await getQueryEmbedding(query);

  let chunks = await repo.knowledge.findSimilarChunks(embedding, threshold, limit);

  // If no chunks found, check if repository has any seeded content; seed if empty
  if (chunks.length === 0) {
    chunks = await repo.knowledge.findSimilarChunks(embedding, -1.0, limit);
  }

  if (chunks.length === 0) {
    await seedDatabase(repo);
    chunks = await repo.knowledge.findSimilarChunks(embedding, -1.0, limit);
  }

  const contextText = chunks
    .map((c, i) => {
      const title = c.sourceTitle || c.source?.title || `Document ${i + 1}`;
      const text = c.content || c.chunk?.content || '';
      return `[Source: ${title}]\n${text}`;
    })
    .join('\n\n');

  return {
    chunks,
    contextText,
  };
}
