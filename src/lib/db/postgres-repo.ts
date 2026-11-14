// ==============================================================================
// File: src/lib/db/postgres-repo.ts
// BridgeMate Live PostgreSQL / Neon Database Repository
// Executes native pgvector `<=>` cosine distance queries via Drizzle ORM
// ==============================================================================

import { eq, sql, desc, asc } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import type {
  IDatabaseRepository,
  AccessibilityPreferences,
  KnowledgeChunkWithSource,
  JobFilters,
} from './types';

export class PostgresDatabaseRepository implements IDatabaseRepository {
  constructor(private db: NeonHttpDatabase<typeof schema>) { }

  // ----------------------------------------------------------------------------
  // Users Domain
  // ----------------------------------------------------------------------------
  public users = {
    getByClerkId: async (clerkId: string): Promise<schema.User | null> => {
      const rows = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkId))
        .limit(1);
      return rows[0] ?? null;
    },

    getById: async (id: string): Promise<schema.User | null> => {
      const rows = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    getByTelegramChatId: async (chatId: string): Promise<schema.User | null> => {
      const rows = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.telegramChatId, chatId))
        .limit(1);
      return rows[0] ?? null;
    },

    getByLinkingToken: async (token: string): Promise<schema.User | null> => {
      const rows = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.telegramLinkingToken, token))
        .limit(1);
      const user = rows[0] ?? null;
      if (user && user.telegramLinkingTokenExpiresAt && new Date(user.telegramLinkingTokenExpiresAt) < new Date()) {
        return null; // Expired
      }
      return user;
    },

    create: async (data: Partial<schema.NewUser> & { clerkId: string }): Promise<schema.User> => {
      const [user] = await this.db
        .insert(schema.users)
        .values(data as schema.NewUser)
        .returning();
      return user!;
    },

    updatePreferences: async (
      userId: string,
      prefs: AccessibilityPreferences
    ): Promise<schema.User> => {
      const [updated] = await this.db
        .update(schema.users)
        .set({
          accessibilityPreferences: prefs,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, userId))
        .returning();
      if (!updated) {
        throw new Error(`User not found: ${userId}`);
      }
      return updated;
    },

    updateProfile: async (
      userId: string,
      data: any
    ): Promise<schema.User> => {
      const [updated] = await this.db
        .update(schema.users)
        .set({
          ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.preferredLanguage !== undefined ? { preferredLanguage: data.preferredLanguage } : {}),
          ...(data.userType !== undefined ? { userType: data.userType } : {}),
          ...(data.disabilityType !== undefined ? { disabilityType: data.disabilityType } : {}),
          ...(data.primaryGoal !== undefined ? { primaryGoal: data.primaryGoal } : {}),
          ...(data.assistiveTech !== undefined ? { assistiveTech: data.assistiveTech } : {}),
          ...(data.onboardingCompleted !== undefined ? { onboardingCompleted: data.onboardingCompleted } : {}),
          ...(data.accessibilityPreferences !== undefined ? { accessibilityPreferences: data.accessibilityPreferences } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, userId))
        .returning();
      if (!updated) {
        throw new Error(`User not found: ${userId}`);
      }
      return updated;
    },

    createLinkingToken: async (userId: string): Promise<string> => {
      const token = `link_${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const [updated] = await this.db
        .update(schema.users)
        .set({
          telegramLinkingToken: token,
          telegramLinkingTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, userId))
        .returning();
      if (!updated) {
        throw new Error(`User not found: ${userId}`);
      }
      return token;
    },

    linkTelegramAccount: async (
      token: string,
      chatId: string,
      username?: string
    ): Promise<schema.User | null> => {
      const rows = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.telegramLinkingToken, token))
        .limit(1);
      const user = rows[0] ?? null;
      if (!user) return null;
      if (user.telegramLinkingTokenExpiresAt && new Date(user.telegramLinkingTokenExpiresAt) < new Date()) {
        return null;
      }
      const [updated] = await this.db
        .update(schema.users)
        .set({
          telegramChatId: chatId,
          telegramUsername: username ?? null,
          telegramLinkingToken: null,
          telegramLinkingTokenExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, user.id))
        .returning();
      return updated ?? null;
    },
  };

  // ----------------------------------------------------------------------------
  // Knowledge & Vector Domain (pgvector dense cosine similarity)
  // ----------------------------------------------------------------------------
  public knowledge = {
    findSimilarChunks: async (
      embedding: number[],
      threshold = 0.65,
      limit = 5
    ): Promise<KnowledgeChunkWithSource[]> => {
      const vectorLiteral = JSON.stringify(embedding);
      // pgvector cosine distance operator is `<=>`. Cosine similarity is 1 - distance.
      const similaritySql = sql<number>`1 - (${schema.knowledgeChunks.embedding} <=> ${vectorLiteral}::vector)`;

      const rows = await this.db
        .select({
          chunk: schema.knowledgeChunks,
          source: schema.knowledgeSources,
          similarity: similaritySql,
        })
        .from(schema.knowledgeChunks)
        .innerJoin(
          schema.knowledgeSources,
          eq(schema.knowledgeChunks.sourceId, schema.knowledgeSources.id)
        )
        .where(
          sql`1 - (${schema.knowledgeChunks.embedding} <=> ${vectorLiteral}::vector) >= ${threshold}`
        )
        .orderBy(desc(similaritySql))
        .limit(limit);

      return rows.map((r) => ({
        ...r.chunk,
        chunk: r.chunk,
        source: r.source,
        sourceTitle: r.source.title,
        similarity: Number(r.similarity),
      }));
    },

    insertSourceWithChunks: async (
      sourceData: Partial<schema.NewKnowledgeSource> & { title: string },
      chunksData: Array<Partial<schema.NewKnowledgeChunk> & { content?: string; chunkText?: string; embedding: number[] }>
    ): Promise<schema.KnowledgeSource> => {
      const [source] = await this.db
        .insert(schema.knowledgeSources)
        .values(sourceData as schema.NewKnowledgeSource)
        .returning();

      if (chunksData.length > 0) {
        const chunkValues = chunksData.map((c, i) => {
          const content = c.content ?? c.chunkText ?? '';
          return {
            ...c,
            content,
            chunkText: c.chunkText ?? content,
            sourceId: source!.id,
            chunkIndex: c.chunkIndex ?? i,
          } as schema.NewKnowledgeChunk;
        });
        await this.db.insert(schema.knowledgeChunks).values(chunkValues);
      }

      return source!;
    },

    getSourceById: async (id: string): Promise<schema.KnowledgeSource | null> => {
      const rows = await this.db
        .select()
        .from(schema.knowledgeSources)
        .where(eq(schema.knowledgeSources.id, id))
        .limit(1);
      return rows[0] ?? null;
    },
  };

  // ----------------------------------------------------------------------------
  // Conversations Domain
  // ----------------------------------------------------------------------------
  public conversations = {
    getById: async (id: string): Promise<schema.Conversation | null> => {
      const rows = await this.db
        .select()
        .from(schema.conversations)
        .where(eq(schema.conversations.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    create: async (data: Partial<schema.NewConversation>): Promise<schema.Conversation> => {
      const [conv] = await this.db
        .insert(schema.conversations)
        .values(data as schema.NewConversation)
        .returning();
      return conv!;
    },

    addMessage: async (
      data: Partial<schema.NewMessage> & { conversationId: string; role: string; content: string }
    ): Promise<schema.Message> => {
      const [message] = await this.db
        .insert(schema.messages)
        .values(data as schema.NewMessage)
        .returning();
      return message!;
    },

    getMessages: async (conversationId: string): Promise<schema.Message[]> => {
      return this.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.conversationId, conversationId))
        .orderBy(asc(schema.messages.createdAt));
    },

    listByUser: async (userId: string): Promise<schema.Conversation[]> => {
      return this.db
        .select()
        .from(schema.conversations)
        .where(eq(schema.conversations.userId, userId))
        .orderBy(desc(schema.conversations.updatedAt));
    },
  };

  // ----------------------------------------------------------------------------
  // Opportunities Domain
  // ----------------------------------------------------------------------------
  public opportunities = {
    createAnalysis: async (
      data: Partial<schema.NewOpportunityAnalysis> & { analysisResult?: any; summaryPlainLanguage?: string }
    ): Promise<schema.OpportunityAnalysis> => {
      const [analysis] = await this.db
        .insert(schema.opportunityAnalyses)
        .values(data as schema.NewOpportunityAnalysis)
        .returning();
      return analysis!;
    },

    getById: async (id: string): Promise<schema.JobOpportunity | null> => {
      const rows = await this.db
        .select()
        .from(schema.jobOpportunities)
        .where(eq(schema.jobOpportunities.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    list: async (filters?: JobFilters): Promise<schema.JobOpportunity[]> => {
      const query = this.db.select().from(schema.jobOpportunities);
      if (filters?.limit) {
        query.limit(filters.limit);
      }
      if (filters?.offset) {
        query.offset(filters.offset);
      }
      return query;
    },

    create: async (
      data: Partial<schema.NewJobOpportunity>
    ): Promise<schema.JobOpportunity> => {
      const [job] = await this.db
        .insert(schema.jobOpportunities)
        .values(data as schema.NewJobOpportunity)
        .returning();
      return job!;
    },
  };

  public jobs = this.opportunities;

  // ----------------------------------------------------------------------------
  // Accommodations Domain
  // ----------------------------------------------------------------------------
  public accommodations = {
    create: async (
      data: Partial<schema.NewAccommodationRequest>
    ): Promise<schema.AccommodationRequest> => {
      const [req] = await this.db
        .insert(schema.accommodationRequests)
        .values(data as schema.NewAccommodationRequest)
        .returning();
      return req!;
    },

    getById: async (id: string): Promise<schema.AccommodationRequest | null> => {
      const rows = await this.db
        .select()
        .from(schema.accommodationRequests)
        .where(eq(schema.accommodationRequests.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    update: async (
      id: string,
      data: Partial<schema.NewAccommodationRequest>
    ): Promise<schema.AccommodationRequest> => {
      const [updated] = await this.db
        .update(schema.accommodationRequests)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(schema.accommodationRequests.id, id))
        .returning();
      if (!updated) {
        throw new Error(`Accommodation request not found: ${id}`);
      }
      return updated;
    },

    listByUser: async (
      userId: string
    ): Promise<schema.AccommodationRequest[]> => {
      return this.db
        .select()
        .from(schema.accommodationRequests)
        .where(eq(schema.accommodationRequests.userId, userId))
        .orderBy(desc(schema.accommodationRequests.updatedAt));
    },
  };

  // ----------------------------------------------------------------------------
  // Support & Consent Domain
  // ----------------------------------------------------------------------------
  public support = {
    createSession: async (
      data: Partial<schema.NewSupportSession>
    ): Promise<schema.SupportSession> => {
      const [session] = await this.db
        .insert(schema.supportSessions)
        .values(data as schema.NewSupportSession)
        .returning();
      return session!;
    },

    getSession: async (id: string): Promise<schema.SupportSession | null> => {
      const rows = await this.db
        .select()
        .from(schema.supportSessions)
        .where(eq(schema.supportSessions.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    updateStatus: async (
      id: string,
      status: 'queued' | 'active' | 'closed',
      agentId?: string
    ): Promise<schema.SupportSession> => {
      const now = new Date();
      const [updated] = await this.db
        .update(schema.supportSessions)
        .set({
          status,
          agentId: agentId !== undefined ? agentId : undefined,
          assignedAgentId: agentId !== undefined ? agentId : undefined,
          closedAt: status === 'closed' ? now : undefined,
          updatedAt: now,
        })
        .where(eq(schema.supportSessions.id, id))
        .returning();
      if (!updated) {
        throw new Error(`Support session not found: ${id}`);
      }
      return updated;
    },

    recordConsent: async (
      data: Partial<schema.NewConsentRecord> & { consentType: string }
    ): Promise<schema.ConsentRecord> => {
      const [consent] = await this.db
        .insert(schema.consentRecords)
        .values(data as schema.NewConsentRecord)
        .returning();
      return consent!;
    },

    listQueued: async (): Promise<schema.SupportSession[]> => {
      return this.db
        .select()
        .from(schema.supportSessions)
        .where(eq(schema.supportSessions.status, 'queued'))
        .orderBy(asc(schema.supportSessions.createdAt));
    },
  };

  // ----------------------------------------------------------------------------
  // Subscriptions Domain
  // ----------------------------------------------------------------------------
  public subscriptions = {
    create: async (
      data: Partial<schema.NewNotificationSubscription> & { channel: 'telegram' | 'sms' | 'web'; channelIdentifier: string }
    ): Promise<schema.NotificationSubscription> => {
      const [sub] = await this.db
        .insert(schema.notificationSubscriptions)
        .values(data as schema.NewNotificationSubscription)
        .returning();
      return sub!;
    },

    getByChannelIdentifier: async (
      identifier: string
    ): Promise<schema.NotificationSubscription | null> => {
      const rows = await this.db
        .select()
        .from(schema.notificationSubscriptions)
        .where(eq(schema.notificationSubscriptions.channelIdentifier, identifier))
        .limit(1);
      return rows[0] ?? null;
    },

    listActive: async (): Promise<schema.NotificationSubscription[]> => {
      return this.db
        .select()
        .from(schema.notificationSubscriptions)
        .where(eq(schema.notificationSubscriptions.active, true));
    },
  };

  public notifications = this.subscriptions;
}

