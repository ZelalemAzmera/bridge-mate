import type { KnowledgeChunkWithSource } from '@/lib/db/types';

export interface FormattedContext {
  promptContext: string;
  citations: Array<{
    id: string;
    sourceTitle: string;
    excerpt: string;
    similarity: number;
  }>;
}

export function buildGroundedContext(chunks: KnowledgeChunkWithSource[]): FormattedContext {
  const citations = chunks.map((c, i) => {
    const title = c.sourceTitle || c.source?.title || `Curriculum Reference ${i + 1}`;
    const rawContent = c.content || c.chunk?.content || '';
    const excerpt = rawContent.slice(0, 180) + (rawContent.length > 180 ? '...' : '');

    return {
      id: c.id?.toString() || `chunk-${i}`,
      sourceTitle: title,
      excerpt,
      similarity: Number((c.similarity || 0.85).toFixed(2)),
    };
  });

  const promptContext = chunks
    .map((c, i) => {
      const title = c.sourceTitle || c.source?.title || `Reference ${i + 1}`;
      const content = c.content || c.chunk?.content || '';
      return `[Source: ${title}]\n${content}`;
    })
    .join('\n\n---\n\n');

  return {
    promptContext: promptContext || 'No verified curriculum documents found.',
    citations,
  };
}

