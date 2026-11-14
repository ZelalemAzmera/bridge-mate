// ==============================================================================
// File: src/lib/db/memory-repo.ts
// BridgeMate Resilient In-Memory Database Repository with Vector Cosine Engine
// Zero external dependencies; 100% offline test compliance.
// ==============================================================================

import type {
  IDatabaseRepository,
  AccessibilityPreferences,
  KnowledgeChunkWithSource,
  JobFilters,
} from './types';
import type {
  User,
  NewUser,
  Conversation,
  NewConversation,
  Message,
  NewMessage,
  KnowledgeSource,
  NewKnowledgeSource,
  KnowledgeChunk,
  NewKnowledgeChunk,
  JobOpportunity,
  NewJobOpportunity,
  OpportunityAnalysis,
  NewOpportunityAnalysis,
  AccommodationRequest,
  NewAccommodationRequest,
  SupportSession,
  NewSupportSession,
  ConsentRecord,
  NewConsentRecord,
  NotificationSubscription,
  NewNotificationSubscription,
} from './schema';

/**
 * Calculates Euclidean L2-norm cosine similarity between two numeric vectors.
 * Returns a value in the range [-1.0, 1.0]. Returns 0 for degenerate/zero vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const len = Math.min(a.length, b.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    const ai = a[i]!;
    const bi = b[i]!;
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }

  if (normA <= 0 || normB <= 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class MemoryDatabaseRepository implements IDatabaseRepository {
  private static instance: MemoryDatabaseRepository;

  private usersStore = new Map<string, User>();
  private clerkToUserId = new Map<string, string>();
  private conversationsStore = new Map<string, Conversation>();
  private messagesStore = new Map<string, Message>();
  private knowledgeSourcesStore = new Map<string, KnowledgeSource>();
  private knowledgeChunksStore = new Map<string, KnowledgeChunk>();
  private jobOpportunitiesStore = new Map<string, JobOpportunity>();
  private opportunityAnalysesStore = new Map<string, OpportunityAnalysis>();
  private accommodationRequestsStore = new Map<string, AccommodationRequest>();
  private supportSessionsStore = new Map<string, SupportSession>();
  private consentRecordsStore = new Map<string, ConsentRecord>();
  private notificationSubscriptionsStore = new Map<string, NotificationSubscription>();

  constructor() {
    this.reset();
  }

  static getInstance(): MemoryDatabaseRepository {
    if (!MemoryDatabaseRepository.instance) {
      MemoryDatabaseRepository.instance = new MemoryDatabaseRepository();
    }
    return MemoryDatabaseRepository.instance;
  }

  /**
   * Clears all in-memory collections. Essential for test harness isolation.
   */
  public reset(): void {
    this.usersStore.clear();
    this.clerkToUserId.clear();
    this.conversationsStore.clear();
    this.messagesStore.clear();
    this.knowledgeSourcesStore.clear();
    this.knowledgeChunksStore.clear();
    this.jobOpportunitiesStore.clear();
    this.opportunityAnalysesStore.clear();
    this.accommodationRequestsStore.clear();
    this.supportSessionsStore.clear();
    this.consentRecordsStore.clear();
    this.notificationSubscriptionsStore.clear();
  }

  // ----------------------------------------------------------------------------
  // Users Domain
  // ----------------------------------------------------------------------------
  public users = {
    getByClerkId: async (clerkId: string): Promise<User | null> => {
      const userId = this.clerkToUserId.get(clerkId);
      if (userId) {
        return this.usersStore.get(userId) ?? null;
      }
      for (const u of this.usersStore.values()) {
        if (u.clerkId === clerkId) return u;
      }
      return null;
    },

    getById: async (id: string): Promise<User | null> => {
      return this.usersStore.get(id) ?? null;
    },

    getByTelegramChatId: async (chatId: string): Promise<User | null> => {
      for (const u of this.usersStore.values()) {
        if (u.telegramChatId === chatId) return u;
      }
      return null;
    },

    getByLinkingToken: async (token: string): Promise<User | null> => {
      for (const u of this.usersStore.values()) {
        if (u.telegramLinkingToken === token) {
          if (u.telegramLinkingTokenExpiresAt && new Date(u.telegramLinkingTokenExpiresAt) < new Date()) {
            return null; // Expired
          }
          return u;
        }
      }
      return null;
    },

    create: async (data: Partial<NewUser> & { clerkId: string }): Promise<User> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const user: User = {
        id,
        clerkId: data.clerkId,
        fullName: data.fullName ?? null,
        email: data.email ?? null,
        phoneNumber: data.phoneNumber ?? null,
        preferredLanguage: data.preferredLanguage ?? 'am',
        userType: data.userType ?? 'pwd',
        disabilityType: data.disabilityType ?? null,
        primaryGoal: data.primaryGoal ?? null,
        assistiveTech: data.assistiveTech ?? [],
        onboardingCompleted: data.onboardingCompleted ?? false,
        telegramChatId: data.telegramChatId ?? null,
        telegramUsername: data.telegramUsername ?? null,
        telegramLinkingToken: data.telegramLinkingToken ?? null,
        telegramLinkingTokenExpiresAt: data.telegramLinkingTokenExpiresAt ?? null,
        accessibilityPreferences: data.accessibilityPreferences ?? {
          highContrast: false,
          fontSizeScale: 1.0,
          dyslexiaFont: false,
          screenReaderOptimized: false,
          reducedMotion: false,
        },
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      };

      this.usersStore.set(id, user);
      this.clerkToUserId.set(user.clerkId, id);
      return user;
    },

    updatePreferences: async (
      userId: string,
      prefs: AccessibilityPreferences
    ): Promise<User> => {
      const existing = this.usersStore.get(userId);
      if (!existing) {
        throw new Error(`User not found: ${userId}`);
      }
      const updated: User = {
        ...existing,
        accessibilityPreferences: {
          ...existing.accessibilityPreferences,
          ...prefs,
        },
        updatedAt: new Date(),
      };
      this.usersStore.set(userId, updated);
      return updated;
    },

    updateProfile: async (
      userId: string,
      data: any
    ): Promise<User> => {
      const existing = this.usersStore.get(userId);
      if (!existing) {
        throw new Error(`User not found: ${userId}`);
      }
      const updated: User = {
        ...existing,
        fullName: data.fullName ?? existing.fullName,
        email: data.email ?? existing.email,
        preferredLanguage: data.preferredLanguage ?? existing.preferredLanguage,
        userType: data.userType ?? existing.userType,
        disabilityType: data.disabilityType ?? existing.disabilityType,
        primaryGoal: data.primaryGoal ?? existing.primaryGoal,
        assistiveTech: data.assistiveTech ?? existing.assistiveTech,
        onboardingCompleted: data.onboardingCompleted ?? existing.onboardingCompleted,
        accessibilityPreferences: {
          ...existing.accessibilityPreferences,
          ...(data.accessibilityPreferences ?? {}),
        },
        updatedAt: new Date(),
      };
      this.usersStore.set(userId, updated);
      return updated;
    },

    createLinkingToken: async (userId: string): Promise<string> => {
      const existing = this.usersStore.get(userId);
      if (!existing) {
        throw new Error(`User not found: ${userId}`);
      }
      const token = `link_${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      existing.telegramLinkingToken = token;
      existing.telegramLinkingTokenExpiresAt = expiresAt;
      existing.updatedAt = new Date();
      this.usersStore.set(userId, existing);
      return token;
    },

    linkTelegramAccount: async (
      token: string,
      chatId: string,
      username?: string
    ): Promise<User | null> => {
      for (const u of this.usersStore.values()) {
        if (u.telegramLinkingToken === token) {
          if (u.telegramLinkingTokenExpiresAt && new Date(u.telegramLinkingTokenExpiresAt) < new Date()) {
            return null; // Expired
          }
          u.telegramChatId = chatId;
          u.telegramUsername = username ?? null;
          u.telegramLinkingToken = null;
          u.telegramLinkingTokenExpiresAt = null;
          u.updatedAt = new Date();
          this.usersStore.set(u.id, u);
          return u;
        }
      }
      return null;
    },
  };

  // ----------------------------------------------------------------------------
  // Knowledge & Vector Domain
  // ----------------------------------------------------------------------------
  public knowledge = {
    findSimilarChunks: async (
      embedding: number[],
      threshold = 0.65,
      limit = 5
    ): Promise<KnowledgeChunkWithSource[]> => {
      const scored: KnowledgeChunkWithSource[] = [];

      for (const chunk of this.knowledgeChunksStore.values()) {
        const similarity = cosineSimilarity(embedding, chunk.embedding);
        if (similarity >= threshold) {
          const source = this.knowledgeSourcesStore.get(chunk.sourceId) ?? {
            id: chunk.sourceId,
            title: 'BridgeMate Knowledge Base',
            slug: null,
            type: 'policy' as const,
            domain: 'vocational',
            domainCategory: 'vocational',
            url: null,
            sourceUrl: null,
            language: chunk.language,
            metadata: null,
            lastIndexedAt: new Date(),
            createdAt: new Date(),
          };
          scored.push({
            ...chunk,
            chunk,
            source,
            sourceTitle: source.title,
            similarity,
          });
        }
      }

      scored.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
      return scored.slice(0, limit);
    },

    insertSourceWithChunks: async (
      sourceData: Partial<NewKnowledgeSource> & { title: string },
      chunksData: Array<Partial<NewKnowledgeChunk> & { content?: string; chunkText?: string; embedding: number[] }>
    ): Promise<KnowledgeSource> => {
      const sourceId = sourceData.id ?? crypto.randomUUID();
      const now = new Date();
      const source: KnowledgeSource = {
        id: sourceId,
        title: sourceData.title,
        slug: sourceData.slug ?? null,
        type: (sourceData.type as any) ?? 'policy',
        domain: sourceData.domain ?? 'vocational',
        domainCategory: sourceData.domainCategory ?? 'vocational',
        url: sourceData.url ?? null,
        sourceUrl: sourceData.sourceUrl ?? null,
        language: sourceData.language ?? 'am',
        metadata: sourceData.metadata ?? null,
        lastIndexedAt: sourceData.lastIndexedAt ?? now,
        createdAt: sourceData.createdAt ?? now,
      };

      this.knowledgeSourcesStore.set(sourceId, source);

      chunksData.forEach((chunkInput, index) => {
        const chunkId = chunkInput.id ?? crypto.randomUUID();
        const content = chunkInput.content ?? chunkInput.chunkText ?? '';
        const chunk: KnowledgeChunk = {
          id: chunkId,
          sourceId,
          content,
          chunkText: chunkInput.chunkText ?? content,
          embedding: chunkInput.embedding,
          language: chunkInput.language ?? source.language,
          chunkIndex: chunkInput.chunkIndex ?? index,
          moduleCode: chunkInput.moduleCode ?? null,
          metadata: chunkInput.metadata ?? {},
          createdAt: chunkInput.createdAt ?? now,
        };
        this.knowledgeChunksStore.set(chunkId, chunk);
      });

      return source;
    },

    getSourceById: async (id: string): Promise<KnowledgeSource | null> => {
      return this.knowledgeSourcesStore.get(id) ?? null;
    },
  };

  // ----------------------------------------------------------------------------
  // Conversations Domain
  // ----------------------------------------------------------------------------
  public conversations = {
    getById: async (id: string): Promise<Conversation | null> => {
      return this.conversationsStore.get(id) ?? null;
    },

    create: async (data: Partial<NewConversation>): Promise<Conversation> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const conv: Conversation = {
        id,
        userId: data.userId ?? null,
        platform: (data.platform as any) ?? 'web',
        channel: data.channel ?? 'web',
        title: data.title ?? 'New Conversation',
        language: data.language ?? 'am',
        status: (data.status as any) ?? 'active',
        metadata: data.metadata ?? {},
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      };
      this.conversationsStore.set(id, conv);
      return conv;
    },

    addMessage: async (
      data: Partial<NewMessage> & { conversationId: string; role: string; content: string }
    ): Promise<Message> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const message: Message = {
        id,
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        language: data.language ?? 'am',
        audioUrl: data.audioUrl ?? null,
        citations: data.citations ?? null,
        metadata: data.metadata ?? {},
        createdAt: data.createdAt ?? now,
      };
      this.messagesStore.set(id, message);
      return message;
    },

    getMessages: async (conversationId: string): Promise<Message[]> => {
      const list: Message[] = [];
      for (const msg of this.messagesStore.values()) {
        if (msg.conversationId === conversationId) {
          list.push(msg);
        }
      }
      return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },

    listByUser: async (userId: string): Promise<Conversation[]> => {
      const list: Conversation[] = [];
      for (const c of this.conversationsStore.values()) {
        if (c.userId === userId) {
          list.push(c);
        }
      }
      return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
  };

  // ----------------------------------------------------------------------------
  // Opportunities Domain
  // ----------------------------------------------------------------------------
  public opportunities = {
    createAnalysis: async (
      data: Partial<NewOpportunityAnalysis> & { analysisResult?: any; summaryPlainLanguage?: string }
    ): Promise<OpportunityAnalysis> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const analysis: OpportunityAnalysis = {
        id,
        userId: data.userId ?? null,
        opportunityId: data.opportunityId ?? null,
        jobOpportunityId: data.jobOpportunityId ?? data.opportunityId ?? null,
        conversationId: data.conversationId ?? null,
        rawText: data.rawText ?? null,
        summaryPlainLanguage: data.summaryPlainLanguage ?? data.analysisResult?.summaryPlainLanguage ?? '',
        keyRequirements: data.keyRequirements ?? data.analysisResult?.keyRequirements ?? [],
        unstatedPhysicalDemands: data.unstatedPhysicalDemands ?? [],
        identifiedBarriers: data.identifiedBarriers ?? [],
        applicationActionPlan: data.applicationActionPlan ?? data.analysisResult?.applicationSteps ?? [],
        verbatimCitations: data.verbatimCitations ?? [],
        analysisResult: data.analysisResult ?? null,
        confidenceScore: data.confidenceScore ?? '0.90',
        createdAt: data.createdAt ?? now,
      };
      this.opportunityAnalysesStore.set(id, analysis);
      return analysis;
    },

    getById: async (id: string): Promise<JobOpportunity | null> => {
      return this.jobOpportunitiesStore.get(id) ?? null;
    },

    list: async (filters?: JobFilters): Promise<JobOpportunity[]> => {
      let list = Array.from(this.jobOpportunitiesStore.values());
      if (filters?.query) {
        const q = filters.query.toLowerCase();
        list = list.filter(
          (j) =>
            (j.parsedData?.title && j.parsedData.title.toLowerCase().includes(q)) ||
            (j.parsedData?.organization && j.parsedData.organization.toLowerCase().includes(q)) ||
            (j.rawContent && j.rawContent.toLowerCase().includes(q)) ||
            (j.title && j.title.toLowerCase().includes(q))
        );
      }
      if (filters?.isRemote !== undefined) {
        list = list.filter((j) => j.parsedData?.isRemote === filters.isRemote);
      }
      if (filters?.language) {
        list = list.filter((j) => j.language === filters.language);
      }
      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? 50;
      return list.slice(offset, offset + limit);
    },

    create: async (data: Partial<NewJobOpportunity>): Promise<JobOpportunity> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const rawContent = data.rawContent ?? data.description ?? '';
      const parsedData = data.parsedData ?? {
        title: data.title ?? 'Job Opportunity',
        organization: data.employerName ?? 'Inclusive Employer',
        location: data.location ?? 'Addis Ababa',
        isRemote: false,
      };

      const job: JobOpportunity = {
        id,
        title: data.title ?? parsedData.title,
        employerName: data.employerName ?? parsedData.organization,
        location: data.location ?? parsedData.location,
        description: data.description ?? rawContent,
        disabilityTags: data.disabilityTags ?? null,
        sourceUrl: data.sourceUrl ?? null,
        rawContent,
        parsedData,
        language: data.language ?? 'am',
        deadline: data.deadline ?? null,
        status: (data.status as any) ?? 'open',
        createdAt: data.createdAt ?? now,
      };
      this.jobOpportunitiesStore.set(id, job);
      return job;
    },
  };

  public jobs = this.opportunities;

  // ----------------------------------------------------------------------------
  // Accommodations Domain
  // ----------------------------------------------------------------------------
  public accommodations = {
    create: async (
      data: Partial<NewAccommodationRequest>
    ): Promise<AccommodationRequest> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const req: AccommodationRequest = {
        id,
        userId: data.userId ?? null,
        opportunityId: data.opportunityId ?? null,
        roleTitle: data.roleTitle ?? 'Requested Role',
        employerName: data.employerName ?? 'Inclusive Employer',
        barrierCategory: data.barrierCategory ?? 'general',
        workplaceTask: data.workplaceTask ?? '',
        requestedAdjustment: data.requestedAdjustment ?? '',
        rawDescription: data.rawDescription ?? data.requestedAdjustment ?? '',
        generatedRequest: data.generatedRequest ?? data.letterBody ?? '',
        requestType: (data.requestType as any) ?? 'workplace',
        letterSubject: data.letterSubject ?? 'Reasonable Accommodation Request',
        letterBody: data.letterBody ?? data.generatedRequest ?? '',
        legalCitations: data.legalCitations ?? [],
        language: data.language ?? 'am',
        status: (data.status as any) ?? 'draft',
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      };
      this.accommodationRequestsStore.set(id, req);
      return req;
    },

    getById: async (id: string): Promise<AccommodationRequest | null> => {
      return this.accommodationRequestsStore.get(id) ?? null;
    },

    update: async (
      id: string,
      data: Partial<NewAccommodationRequest>
    ): Promise<AccommodationRequest> => {
      const existing = this.accommodationRequestsStore.get(id);
      if (!existing) {
        throw new Error(`Accommodation request not found: ${id}`);
      }
      const updated: AccommodationRequest = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      this.accommodationRequestsStore.set(id, updated);
      return updated;
    },

    listByUser: async (userId: string): Promise<AccommodationRequest[]> => {
      const list: AccommodationRequest[] = [];
      for (const req of this.accommodationRequestsStore.values()) {
        if (req.userId === userId) {
          list.push(req);
        }
      }
      return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
  };

  // ----------------------------------------------------------------------------
  // Support & Consent Domain
  // ----------------------------------------------------------------------------
  public support = {
    createSession: async (data: Partial<NewSupportSession>): Promise<SupportSession> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const session: SupportSession = {
        id,
        userId: data.userId ?? null,
        conversationId: data.conversationId ?? null,
        channel: data.channel ?? 'web',
        status: (data.status as any) ?? 'queued',
        assignedAgentId: data.assignedAgentId ?? data.agentId ?? null,
        agentId: data.agentId ?? data.assignedAgentId ?? null,
        redisSessionKey: data.redisSessionKey ?? null,
        structuredPacket: data.structuredPacket ?? null,
        handoffPacket: data.handoffPacket ?? {
          userGoal: 'Human support handoff',
          disclosedNeeds: [],
          painPoints: [],
          recommendedAgentAction: 'Assist jobseeker with current step',
        },
        screenShareEnabled: data.screenShareEnabled ?? false,
        startedAt: data.startedAt ?? null,
        closedAt: data.closedAt ?? null,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      };
      this.supportSessionsStore.set(id, session);
      return session;
    },

    getSession: async (id: string): Promise<SupportSession | null> => {
      return this.supportSessionsStore.get(id) ?? null;
    },

    updateStatus: async (
      id: string,
      status: 'queued' | 'active' | 'closed',
      agentId?: string
    ): Promise<SupportSession> => {
      const session = this.supportSessionsStore.get(id);
      if (!session) {
        throw new Error(`Support session not found: ${id}`);
      }
      const now = new Date();
      const updated: SupportSession = {
        ...session,
        status,
        agentId: agentId !== undefined ? agentId : session.agentId,
        assignedAgentId: agentId !== undefined ? agentId : session.assignedAgentId,
        startedAt: status === 'active' && !session.startedAt ? now : session.startedAt,
        closedAt: status === 'closed' ? now : session.closedAt,
        updatedAt: now,
      };
      this.supportSessionsStore.set(id, updated);
      return updated;
    },

    recordConsent: async (
      data: Partial<NewConsentRecord> & { consentType: string }
    ): Promise<ConsentRecord> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const record: ConsentRecord = {
        id,
        sessionId: data.sessionId ?? data.supportSessionId ?? null,
        supportSessionId: data.supportSessionId ?? data.sessionId ?? null,
        userId: data.userId ?? null,
        consentType: data.consentType as any,
        granted: data.granted ?? true,
        dataShared: data.dataShared ?? {},
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        timestamp: data.timestamp ?? now,
        grantedAt: data.grantedAt ?? now,
      };
      this.consentRecordsStore.set(id, record);
      return record;
    },

    listQueued: async (): Promise<SupportSession[]> => {
      const list: SupportSession[] = [];
      for (const s of this.supportSessionsStore.values()) {
        if (s.status === 'queued') {
          list.push(s);
        }
      }
      return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
  };

  // ----------------------------------------------------------------------------
  // Subscriptions Domain
  // ----------------------------------------------------------------------------
  public subscriptions = {
    create: async (
      data: Partial<NewNotificationSubscription> & { channel: 'telegram' | 'sms' | 'web'; channelIdentifier: string }
    ): Promise<NotificationSubscription> => {
      const id = data.id ?? crypto.randomUUID();
      const now = new Date();
      const sub: NotificationSubscription = {
        id,
        userId: data.userId ?? null,
        phoneNumber: data.phoneNumber ?? data.channelIdentifier ?? null,
        channel: data.channel,
        channelIdentifier: data.channelIdentifier,
        keywordFilter: data.keywordFilter ?? null,
        jobCategories: data.jobCategories ?? [],
        disabilityCategories: data.disabilityCategories ?? null,
        language: data.language ?? 'am',
        active: data.active ?? data.isActive ?? true,
        isActive: data.isActive ?? data.active ?? true,
        createdAt: data.createdAt ?? now,
      };
      this.notificationSubscriptionsStore.set(id, sub);
      return sub;
    },

    getByChannelIdentifier: async (
      identifier: string
    ): Promise<NotificationSubscription | null> => {
      for (const sub of this.notificationSubscriptionsStore.values()) {
        if (sub.channelIdentifier === identifier || sub.phoneNumber === identifier) {
          return sub;
        }
      }
      return null;
    },

    listActive: async (): Promise<NotificationSubscription[]> => {
      const list: NotificationSubscription[] = [];
      for (const s of this.notificationSubscriptionsStore.values()) {
        if (s.active || s.isActive) {
          list.push(s);
        }
      }
      return list;
    },
  };

  public notifications = this.subscriptions;
}

// Global in-memory singleton
let memoryRepoInstance: MemoryDatabaseRepository | null = null;

export function getMemoryRepository(): MemoryDatabaseRepository {
  if (!memoryRepoInstance) {
    memoryRepoInstance = MemoryDatabaseRepository.getInstance();
  }
  return memoryRepoInstance;
}

