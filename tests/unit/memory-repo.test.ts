import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMemoryRepository,
  cosineSimilarity,
  MemoryDatabaseRepository,
} from '@/lib/db/memory-repo';
import { seedDatabase, createSyntheticEmbedding } from '@/lib/db/seed';

describe('Database Repository & Vector Engine Unit Tests (src/lib/db/memory-repo.ts)', () => {
  let repo: MemoryDatabaseRepository;

  beforeEach(() => {
    repo = getMemoryRepository();
    repo.reset();
  });

  describe('Vector Cosine Similarity Engine', () => {
    it('returns 1.0 for identical non-zero vectors', () => {
      const v1 = [1, 0, 0, 0];
      const v2 = [1, 0, 0, 0];
      const sim = cosineSimilarity(v1, v2);
      expect(sim).toBeCloseTo(1.0, 5);
    });

    it('returns 0.0 for orthogonal vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [0, 1, 0];
      const sim = cosineSimilarity(v1, v2);
      expect(sim).toBeCloseTo(0.0, 5);
    });

    it('calculates partial alignment correctly (~0.707 for 45-degree angle)', () => {
      const v1 = [1, 1];
      const v2 = [1, 0];
      const sim = cosineSimilarity(v1, v2);
      expect(sim).toBeCloseTo(Math.SQRT1_2, 4); // 0.7071
    });

    it('handles degenerate empty or zero vectors safely without NaN', () => {
      expect(cosineSimilarity([], [])).toBe(0);
      expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
      expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
    });
  });

  describe('Users Domain CRUD', () => {
    it('creates a user and retrieves by Clerk ID', async () => {
      const created = await repo.users.create({
        clerkId: 'user_test_clerk_123',
        fullName: 'Selamawit Tadesse',
        email: 'selam@test.et',
        preferredLanguage: 'am',
      });

      expect(created.id).toBeDefined();
      expect(created.clerkId).toBe('user_test_clerk_123');
      expect(created.preferredLanguage).toBe('am');

      const fetched = await repo.users.getByClerkId('user_test_clerk_123');
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.fullName).toBe('Selamawit Tadesse');
    });

    it('returns null for non-existent Clerk ID', async () => {
      const nonExistent = await repo.users.getByClerkId('does_not_exist');
      expect(nonExistent).toBeNull();
    });

    it('updates accessibility preferences cleanly', async () => {
      const user = await repo.users.create({
        clerkId: 'user_a11y_prefs',
      });

      const updated = await repo.users.updatePreferences(user.id, {
        highContrast: true,
        fontSizeScale: 1.5,
        dyslexiaFont: true,
        screenReaderOptimized: true,
      });

      expect(updated.accessibilityPreferences?.highContrast).toBe(true);
      expect(updated.accessibilityPreferences?.fontSizeScale).toBe(1.5);
      expect(updated.accessibilityPreferences?.dyslexiaFont).toBe(true);
    });
  });

  describe('Conversations & Messages Domain', () => {
    it('creates conversations and stores chronological messages', async () => {
      const conv = await repo.conversations.create({
        userId: 'user_1',
        title: 'Python Course Inquiry',
        language: 'am',
      });

      expect(conv.id).toBeDefined();
      expect(conv.title).toBe('Python Course Inquiry');

      const msg1 = await repo.conversations.addMessage({
        conversationId: conv.id,
        role: 'user',
        content: 'ስለ ዳታ ሳይንስ ትምህርት ማወቅ እፈልጋለሁ።',
      });

      const msg2 = await repo.conversations.addMessage({
        conversationId: conv.id,
        role: 'assistant',
        content: 'እንኳን ደህና መጡ! የዳታ ሳይንስ ትምህርት መሰረታዊ የፓይተን ዕውቀትን ያካትታል።',
      });

      expect(msg1.id).toBeDefined();
      expect(msg2.id).toBeDefined();

      const messages = await repo.conversations.getMessages(conv.id);
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toContain('ስለ ዳታ ሳይንስ');
      expect(messages[1].content).toContain('እንኳን ደህና መጡ');
    });
  });

  describe('Knowledge Base & Vector Cosine Similarity Search', () => {
    it('computes cosine similarity and filters chunks by threshold', async () => {
      // Create 1536-dimensional normalized test vectors
      const createVector = (primaryDim: number): number[] => {
        const vec = new Array(1536).fill(0);
        vec[primaryDim] = 1.0;
        return vec;
      };

      const vecAccounting = createVector(0);
      const vecBookkeeping = new Array(1536).fill(0);
      vecBookkeeping[0] = 0.9;
      vecBookkeeping[1] = 0.1; // High similarity to accounting (>0.9)
      const vecWelding = createVector(10); // Orthogonal, similarity = 0.0

      await repo.knowledge.insertSourceWithChunks(
        {
          id: 'src_curriculum_1',
          title: 'Vocational Curriculum',
          domain: 'vocational',
          language: 'am',
        },
        [
          {
            id: 'chunk_1',
            sourceId: 'src_curriculum_1',
            content: 'የሂሳብ መዝገብ አያያዝ መሰረታዊ መርሆች (Accounting Principles)',
            embedding: vecAccounting,
            moduleCode: 'ACCT-101',
          },
          {
            id: 'chunk_2',
            sourceId: 'src_curriculum_1',
            content: 'የመጽሐፍ አያያዝ ተግባራት (Bookkeeping tasks)',
            embedding: vecBookkeeping,
            moduleCode: 'ACCT-102',
          },
          {
            id: 'chunk_3',
            sourceId: 'src_curriculum_1',
            content: 'የብየዳ ደህንነት እና ጥንቃቄዎች (Welding safety)',
            embedding: vecWelding,
            moduleCode: 'WELD-201',
          },
        ]
      );

      // Query with Accounting vector
      const results = await repo.knowledge.findSimilarChunks(vecAccounting, 0.65, 5);

      // Only Accounting and Bookkeeping chunks should exceed threshold 0.65
      expect(results).toHaveLength(2);
      expect(results[0].chunk.id).toBe('chunk_1');
      expect(results[0].similarity).toBeCloseTo(1.0, 2);
      expect(results[1].chunk.id).toBe('chunk_2');
      expect(results[1].similarity).toBeGreaterThan(0.65);

      // Welding chunk must be filtered out
      const hasWelding = results.some((r) => r.chunk.id === 'chunk_3');
      expect(hasWelding).toBe(false);
    });
  });

  describe('Accommodations & Support Domains', () => {
    it('creates accommodation requests and retrieves by ID', async () => {
      const created = await repo.accommodations.create({
        userId: 'user_1',
        roleTitle: 'Software Developer',
        employerName: 'Ethio Telecom',
        barrierCategory: 'mobility',
        workplaceTask: 'Commuting to regional offices',
        requestedAdjustment: 'Remote work flexibility 3 days per week',
      });

      expect(created.id).toBeDefined();
      expect(created.roleTitle).toBe('Software Developer');

      const fetched = await repo.accommodations.getById(created.id);
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.employerName).toBe('Ethio Telecom');
    });

    it('creates support session and manages queue status transition', async () => {
      const session = await repo.support.createSession({
        userId: 'user_1',
        channel: 'web',
        status: 'queued',
      });

      expect(session.id).toBeDefined();
      expect(session.status).toBe('queued');

      const queuedList = await repo.support.listQueued();
      expect(queuedList.some((s) => s.id === session.id)).toBe(true);

      const activeSession = await repo.support.updateStatus(session.id, 'active', 'agent_selam_01');
      expect(activeSession.status).toBe('active');
      expect(activeSession.agentId).toBe('agent_selam_01');

      const consent = await repo.support.recordConsent({
        sessionId: session.id,
        consentType: 'screen_share',
        granted: true,
      });
      expect(consent.id).toBeDefined();
      expect(consent.granted).toBe(true);
    });
  });

  describe('Database Seed Fixtures', () => {
    it('seeds knowledge base and job opportunities successfully', async () => {
      await seedDatabase(repo);

      const jobs = await repo.opportunities.list();
      expect(jobs.length).toBeGreaterThanOrEqual(2);

      // Query with synthetic embedding (angle 1.0) for Ethiopian Labor Law
      const queryVec = createSyntheticEmbedding(1.0);
      const similar = await repo.knowledge.findSimilarChunks(queryVec, 0.65, 3);

      expect(similar.length).toBeGreaterThanOrEqual(1);
      expect(similar[0].sourceTitle).toContain('Labor Proclamation');
    });
  });
});

