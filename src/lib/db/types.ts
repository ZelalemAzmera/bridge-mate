// ==============================================================================
// File: src/lib/db/types.ts
// BridgeMate Database Repository Interface and Domain Types
// ==============================================================================

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

export type AccessibilityPreferences = {
  highContrast?: boolean;
  fontSizeScale?: number; // 1.0, 1.25, 1.5, 2.0
  dyslexiaFont?: boolean;
  screenReaderOptimized?: boolean;
  reducedMotion?: boolean;
};

export type OnboardingData = {
  fullName?: string;
  email?: string;
  preferredLanguage?: string;
  userType?: 'pwd' | 'ally' | 'employer' | 'educator';
  disabilityType?: string;
  primaryGoal?: string;
  assistiveTech?: string[];
  accessibilityPreferences?: AccessibilityPreferences;
  onboardingCompleted?: boolean;
};

export type KnowledgeChunkWithSource = KnowledgeChunk & {
  chunk: KnowledgeChunk;
  source: KnowledgeSource;
  sourceTitle: string;
  similarity: number;
};

export type JobFilters = {
  category?: string;
  isRemote?: boolean;
  query?: string;
  language?: string;
  limit?: number;
  offset?: number;
};

export interface IDatabaseRepository {
  users: {
    getByClerkId(clerkId: string): Promise<User | null>;
    getById(id: string): Promise<User | null>;
    getByTelegramChatId(chatId: string): Promise<User | null>;
    getByLinkingToken(token: string): Promise<User | null>;
    create(data: Partial<NewUser> & { clerkId: string }): Promise<User>;
    updatePreferences(
      userId: string,
      prefs: AccessibilityPreferences
    ): Promise<User>;
    updateProfile(
      userId: string,
      data: Partial<OnboardingData>
    ): Promise<User>;
    createLinkingToken(userId: string): Promise<string>;
    linkTelegramAccount(
      token: string,
      chatId: string,
      username?: string
    ): Promise<User | null>;
  };
  knowledge: {
    findSimilarChunks(
      embedding: number[],
      threshold?: number,
      limit?: number
    ): Promise<KnowledgeChunkWithSource[]>;
    insertSourceWithChunks(
      source: Partial<NewKnowledgeSource> & { title: string },
      chunks: Array<Partial<NewKnowledgeChunk> & { content?: string; chunkText?: string; embedding: number[] }>
    ): Promise<KnowledgeSource>;
    getSourceById(id: string): Promise<KnowledgeSource | null>;
  };
  conversations: {
    getById(id: string): Promise<Conversation | null>;
    create(data: Partial<NewConversation>): Promise<Conversation>;
    addMessage(data: Partial<NewMessage> & { conversationId: string; role: string; content: string }): Promise<Message>;
    getMessages(conversationId: string): Promise<Message[]>;
    listByUser(userId: string): Promise<Conversation[]>;
  };
  opportunities: {
    createAnalysis(data: Partial<NewOpportunityAnalysis> & { analysisResult?: any; summaryPlainLanguage?: string }): Promise<OpportunityAnalysis>;
    getById(id: string): Promise<JobOpportunity | null>;
    list(filters?: JobFilters): Promise<JobOpportunity[]>;
    create(data: Partial<NewJobOpportunity>): Promise<JobOpportunity>;
  };
  jobs: {
    createAnalysis(data: Partial<NewOpportunityAnalysis> & { analysisResult?: any; summaryPlainLanguage?: string }): Promise<OpportunityAnalysis>;
    getById(id: string): Promise<JobOpportunity | null>;
    list(filters?: JobFilters): Promise<JobOpportunity[]>;
    create(data: Partial<NewJobOpportunity>): Promise<JobOpportunity>;
  };
  accommodations: {
    create(data: Partial<NewAccommodationRequest>): Promise<AccommodationRequest>;
    getById(id: string): Promise<AccommodationRequest | null>;
    update(
      id: string,
      data: Partial<NewAccommodationRequest>
    ): Promise<AccommodationRequest>;
    listByUser(userId: string): Promise<AccommodationRequest[]>;
  };
  support: {
    createSession(data: Partial<NewSupportSession>): Promise<SupportSession>;
    getSession(id: string): Promise<SupportSession | null>;
    updateStatus(
      id: string,
      status: 'queued' | 'active' | 'closed',
      agentId?: string
    ): Promise<SupportSession>;
    recordConsent(data: Partial<NewConsentRecord> & { consentType: string }): Promise<ConsentRecord>;
    listQueued(): Promise<SupportSession[]>;
  };
  subscriptions: {
    create(
      data: Partial<NewNotificationSubscription> & { channel: 'telegram' | 'sms' | 'web'; channelIdentifier: string }
    ): Promise<NotificationSubscription>;
    getByChannelIdentifier(
      identifier: string
    ): Promise<NotificationSubscription | null>;
    listActive(): Promise<NotificationSubscription[]>;
  };
  notifications: {
    create(
      data: Partial<NewNotificationSubscription> & { channel: 'telegram' | 'sms' | 'web'; channelIdentifier: string }
    ): Promise<NotificationSubscription>;
    getByChannelIdentifier(
      identifier: string
    ): Promise<NotificationSubscription | null>;
    listActive(): Promise<NotificationSubscription[]>;
  };
}

