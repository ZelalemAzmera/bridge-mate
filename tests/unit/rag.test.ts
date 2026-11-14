import { describe, it, expect } from 'vitest';
import { chunkText } from '@/lib/ai/rag/chunker';
import { buildGroundedContext } from '@/lib/ai/rag/context-builder';
import { buildSystemPrompt } from '@/lib/ai/prompts/system-chat';
import { retrieveRelevantChunks } from '@/lib/ai/rag/retriever';

describe('RAG Chunker (src/lib/ai/rag/chunker.ts)', () => {
  it('returns single chunk when text length is within chunk size', () => {
    const text = 'ይህ አጭር የሙከራ ፅሁፍ ነው።';
    const chunks = chunkText(text, { chunkSize: 500, chunkOverlap: 50 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it('splits longer documents into overlapping chunks on sentence boundaries', () => {
    const paragraph = 'የኮምፒውተር ፕሮግራሚንግ መማር የዲጂታል ዘመን ቁልፍ ክህሎት ነው። ማንኛውም ሰው በትጋት ሊማረው ይችላል። ';
    const longText = paragraph.repeat(15);
    const chunks = chunkText(longText, { chunkSize: 200, chunkOverlap: 40 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(250);
  });

  it('handles empty input gracefully', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   ')).toEqual([]);
  });
});

describe('RAG Context Builder (src/lib/ai/rag/context-builder.ts)', () => {
  it('formats retrieved chunks into citation records and prompt context', () => {
    const mockChunks: any[] = [
      {
        id: 'chunk-1',
        content: 'የኢትዮጵያ አዋጅ ቁጥር 568/2008 የአካል ጉዳተኞችን የሥራ ስምሪት መብት ያረጋግጣል።',
        sourceTitle: 'አዋጅ ቁጥር 568/2008',
        similarity: 0.92,
      },
      {
        id: 'chunk-2',
        content: 'Web development includes HTML, CSS, JavaScript, and accessibility guidelines.',
        sourceTitle: 'Frontend Course',
        similarity: 0.88,
      },
    ];

    const result = buildGroundedContext(mockChunks);
    expect(result.citations).toHaveLength(2);
    expect(result.citations[0].sourceTitle).toBe('አዋጅ ቁጥር 568/2008');
    expect(result.citations[0].similarity).toBe(0.92);
    expect(result.promptContext).toContain('[Source: አዋጅ ቁጥር 568/2008]');
    expect(result.promptContext).toContain('[Source: Frontend Course]');
  });
});

describe('System Chat Prompt Builder (src/lib/ai/prompts/system-chat.ts)', () => {
  it('injects retrieved context into system prompt', () => {
    const context = '[Source: Intro to Web]\nHTML is the foundation of web pages.';
    const prompt = buildSystemPrompt(context);
    expect(prompt).toContain('HTML is the foundation of web pages.');
    expect(prompt).toContain('BridgeMate AI (ብሪጅሜት)');
    expect(prompt).toContain('LANGUAGE PARITY');
  });
});

describe('RAG Retriever with Database Repository (src/lib/ai/rag/retriever.ts)', () => {
  it('retrieves relevant knowledge chunks with source title', async () => {
    const { chunks, contextText } = await retrieveRelevantChunks('programming web development');
    expect(chunks).toBeDefined();
    expect(Array.isArray(chunks)).toBe(true);
    expect(contextText.length).toBeGreaterThan(0);
  });
});

