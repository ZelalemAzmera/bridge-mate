// ==============================================================================
// File: src/lib/db/schema.ts
// BridgeMate Database Schema Definition (Drizzle ORM + Neon PostgreSQL + pgvector)
// All 11 tables, custom vector(1536) type, indexes, and full relational mappings.
// ==============================================================================

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ------------------------------------------------------------------------------
// Custom pgvector type for 1536-dimensional vector embeddings
// Handles dual driver representations (stringified JSON vs. native array)
// ------------------------------------------------------------------------------
export const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions?: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown): number[] {
    if (Array.isArray(value)) return value as number[];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // Fallback for PostgreSQL native string format: "[0.1,0.2,...]"
        const cleaned = value.replace(/^\[|\]$/g, '');
        return cleaned ? cleaned.split(',').map((v) => Number(v.trim())) : [];
      }
    }
    return [];
  },
});

// ------------------------------------------------------------------------------
// 1. Users Table
// ------------------------------------------------------------------------------
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clerkId: varchar('clerk_id', { length: 256 }).notNull().unique(),
    fullName: varchar('full_name', { length: 256 }),
    email: varchar('email', { length: 256 }),
    phoneNumber: varchar('phone_number', { length: 64 }),
    preferredLanguage: varchar('preferred_language', { length: 8 })
      .default('am')
      .notNull(),
    accessibilityPreferences: jsonb('accessibility_preferences')
      .$type<{
        screenReaderOptimized?: boolean;
        highContrast?: boolean;
        fontSizeScale?: number;
        reducedMotion?: boolean;
        dyslexiaFont?: boolean;
      }>()
      .default({
        highContrast: false,
        fontSizeScale: 1.0,
        dyslexiaFont: false,
        screenReaderOptimized: false,
        reducedMotion: false,
      }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    clerkIdIdx: index('users_clerk_id_idx').on(table.clerkId),
  })
);

// ------------------------------------------------------------------------------
// 2. Conversations Table
// ------------------------------------------------------------------------------
export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    platform: varchar('platform', { length: 32 })
      .$type<'web' | 'telegram' | 'sms'>()
      .default('web')
      .notNull(),
    channel: varchar('channel', { length: 32 }).default('web').notNull(),
    title: varchar('title', { length: 256 }).default('New Conversation'),
    language: varchar('language', { length: 8 }).default('am').notNull(),
    status: varchar('status', { length: 32 })
      .$type<'active' | 'archived' | 'escalated'>()
      .default('active')
      .notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('conversations_user_id_idx').on(table.userId),
  })
);

// ------------------------------------------------------------------------------
// 3. Messages Table
// ------------------------------------------------------------------------------
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .references(() => conversations.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 32 })
      .$type<'user' | 'assistant' | 'system'>()
      .notNull(),
    content: text('content').notNull(),
    language: varchar('language', { length: 8 }).default('am').notNull(),
    audioUrl: text('audio_url'),
    citations: jsonb('citations').$type<
      Array<{
        chunkId?: string;
        sourceId?: string;
        sourceTitle?: string;
        title?: string;
        verbatimText?: string;
        similarity?: number;
      }>
    >(),
    metadata: jsonb('metadata')
      .$type<{
        citations?: Array<{ sourceId: string; chunkId: string; title: string }>;
        latencyMs?: number;
        modelUsed?: string;
      }>()
      .default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    conversationIdIdx: index('messages_conversation_id_idx').on(
      table.conversationId
    ),
  })
);

// ------------------------------------------------------------------------------
// 4. Knowledge Sources Table
// ------------------------------------------------------------------------------
export const knowledgeSources = pgTable('knowledge_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }),
  type: varchar('type', { length: 64 })
    .$type<'course' | 'faq' | 'policy' | 'guide'>()
    .default('policy')
    .notNull(),
  domain: varchar('domain', { length: 64 }).default('vocational'),
  domainCategory: varchar('domain_category', { length: 64 }).default('vocational'),
  url: text('url'),
  sourceUrl: varchar('source_url', { length: 512 }),
  language: varchar('language', { length: 8 }).default('am').notNull(),
  metadata: jsonb('metadata'),
  lastIndexedAt: timestamp('last_indexed_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ------------------------------------------------------------------------------
// 5. Knowledge Chunks Table (RAG Vector Storage)
// ------------------------------------------------------------------------------
export const knowledgeChunks = pgTable(
  'knowledge_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sourceId: uuid('source_id')
      .references(() => knowledgeSources.id, { onDelete: 'cascade' })
      .notNull(),
    content: text('content').notNull(),
    chunkText: text('chunk_text'),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    language: varchar('language', { length: 8 }).default('am').notNull(),
    chunkIndex: integer('chunk_index').default(0).notNull(),
    moduleCode: varchar('module_code', { length: 64 }),
    metadata: jsonb('metadata')
      .$type<{
        section?: string;
        tokenCount?: number;
      }>()
      .default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sourceIdIdx: index('knowledge_chunks_source_id_idx').on(table.sourceId),
  })
);

// ------------------------------------------------------------------------------
// 6. Job Opportunities Table
// ------------------------------------------------------------------------------
export const jobOpportunities = pgTable('job_opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 256 }),
  employerName: varchar('employer_name', { length: 256 }),
  location: varchar('location', { length: 256 }).default('Addis Ababa'),
  description: text('description'),
  disabilityTags: jsonb('disability_tags').$type<string[]>(),
  sourceUrl: text('source_url'),
  rawContent: text('raw_content').default('').notNull(),
  parsedData: jsonb('parsed_data')
    .$type<{
      title: string;
      organization: string;
      location: string;
      deadline?: string;
      accessibilityFeatures?: string[];
      isRemote: boolean;
    }>()
    .default({
      title: 'Opportunity',
      organization: 'Inclusive Employer',
      location: 'Addis Ababa',
      isRemote: false,
    })
    .notNull(),
  language: varchar('language', { length: 8 }).default('am').notNull(),
  deadline: timestamp('deadline', { withTimezone: true }),
  status: varchar('status', { length: 32 })
    .$type<'open' | 'closed' | 'draft'>()
    .default('open')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ------------------------------------------------------------------------------
// 7. Opportunity Analyses Table
// ------------------------------------------------------------------------------
export const opportunityAnalyses = pgTable(
  'opportunity_analyses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    opportunityId: uuid('opportunity_id').references(
      () => jobOpportunities.id,
      { onDelete: 'set null' }
    ),
    jobOpportunityId: uuid('job_opportunity_id').references(
      () => jobOpportunities.id,
      { onDelete: 'set null' }
    ),
    conversationId: uuid('conversation_id').references(
      () => conversations.id,
      { onDelete: 'set null' }
    ),
    rawText: text('raw_text'),
    summaryPlainLanguage: text('summary_plain_language'),
    keyRequirements: jsonb('key_requirements').$type<string[]>(),
    unstatedPhysicalDemands: jsonb('unstated_physical_demands').$type<
      Array<{
        demand: string;
        severity: 'low' | 'medium' | 'high';
        explanation: string;
      }>
    >(),
    identifiedBarriers: jsonb('identified_barriers').$type<
      Array<{
        category: 'mobility' | 'visual' | 'auditory' | 'neurodivergent' | 'general';
        description: string;
        suggestedAccommodation: string;
      }>
    >(),
    applicationActionPlan: jsonb('application_action_plan').$type<string[]>(),
    verbatimCitations: jsonb('verbatim_citations').$type<string[]>(),
    analysisResult: jsonb('analysis_result')
      .$type<{
        summaryPlainLanguage: string;
        keyRequirements: string[];
        potentialBarriers: Array<{
          barrier: string;
          severity: 'low' | 'medium' | 'high';
          category: string;
        }>;
        accommodationTips: string[];
        applicationSteps: string[];
      }>(),
    confidenceScore: varchar('confidence_score', { length: 16 }).default('0.90'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('opportunity_analyses_user_id_idx').on(table.userId),
  })
);

// ------------------------------------------------------------------------------
// 8. Accommodation Requests Table
// ------------------------------------------------------------------------------
export const accommodationRequests = pgTable(
  'accommodation_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    opportunityId: uuid('opportunity_id').references(
      () => jobOpportunities.id,
      { onDelete: 'set null' }
    ),
    roleTitle: varchar('role_title', { length: 256 }),
    employerName: varchar('employer_name', { length: 256 }),
    barrierCategory: varchar('barrier_category', { length: 64 }),
    workplaceTask: text('workplace_task'),
    requestedAdjustment: text('requested_adjustment'),
    rawDescription: text('raw_description'),
    generatedRequest: text('generated_request'),
    requestType: varchar('request_type', { length: 64 })
      .$type<'job_interview' | 'workplace' | 'education' | 'exam'>()
      .default('workplace'),
    letterSubject: varchar('letter_subject', { length: 256 }),
    letterBody: text('letter_body'),
    legalCitations: jsonb('legal_citations').$type<
      Array<{
        proclamation: string;
        article: string;
        textSummary: string;
      }>
    >(),
    language: varchar('language', { length: 8 }).default('am').notNull(),
    status: varchar('status', { length: 32 })
      .$type<'draft' | 'approved' | 'sent'>()
      .default('draft')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('accommodation_requests_user_id_idx').on(table.userId),
  })
);

// ------------------------------------------------------------------------------
// 9. Support Sessions Table
// ------------------------------------------------------------------------------
export const supportSessions = pgTable(
  'support_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    conversationId: uuid('conversation_id').references(
      () => conversations.id,
      { onDelete: 'set null' }
    ),
    channel: varchar('channel', { length: 32 }).default('web').notNull(),
    status: varchar('status', { length: 32 })
      .$type<'queued' | 'active' | 'closed'>()
      .default('queued')
      .notNull(),
    assignedAgentId: varchar('assigned_agent_id', { length: 256 }),
    agentId: varchar('agent_id', { length: 256 }),
    redisSessionKey: varchar('redis_session_key', { length: 256 }),
    structuredPacket: jsonb('structured_packet'),
    handoffPacket: jsonb('handoff_packet').$type<{
      userGoal?: string;
      disclosedNeeds?: string[];
      painPoints?: string[];
      recommendedAgentAction?: string;
    }>(),
    screenShareEnabled: boolean('screen_share_enabled').default(false).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    statusIdx: index('support_sessions_status_idx').on(table.status),
  })
);

// ------------------------------------------------------------------------------
// 10. Consent Records Table
// ------------------------------------------------------------------------------
export const consentRecords = pgTable(
  'consent_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id').references(() => supportSessions.id, {
      onDelete: 'cascade',
    }),
    supportSessionId: uuid('support_session_id').references(
      () => supportSessions.id,
      { onDelete: 'cascade' }
    ),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    consentType: varchar('consent_type', { length: 64 })
      .$type<'screen_share' | 'transcript_sharing' | 'audio_recording' | 'transcript'>()
      .notNull(),
    granted: boolean('granted').default(true).notNull(),
    dataShared: jsonb('data_shared').$type<Record<string, unknown>>().default({}),
    ipAddress: varchar('ip_address', { length: 64 }),
    userAgent: text('user_agent'),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .defaultNow()
      .notNull(),
    grantedAt: timestamp('granted_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sessionConsentIdx: index('consent_records_session_idx').on(
      table.supportSessionId
    ),
  })
);

// ------------------------------------------------------------------------------
// 11. Notification Subscriptions Table
// ------------------------------------------------------------------------------
export const notificationSubscriptions = pgTable(
  'notification_subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    phoneNumber: varchar('phone_number', { length: 64 }),
    channel: varchar('channel', { length: 32 })
      .$type<'telegram' | 'sms' | 'web'>()
      .default('sms')
      .notNull(),
    channelIdentifier: varchar('channel_identifier', { length: 256 }),
    keywordFilter: varchar('keyword_filter', { length: 256 }),
    jobCategories: jsonb('job_categories').$type<string[]>().default([]),
    disabilityCategories: jsonb('disability_categories').$type<string[]>(),
    language: varchar('language', { length: 8 }).default('am').notNull(),
    active: boolean('active').default(true).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    identifierIdx: index('subscriptions_identifier_idx').on(
      table.channelIdentifier
    ),
  })
);

// ------------------------------------------------------------------------------
// Relational Mappings
// ------------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  accommodationRequests: many(accommodationRequests),
  supportSessions: many(supportSessions),
  opportunityAnalyses: many(opportunityAnalyses),
  consentRecords: many(consentRecords),
  notificationSubscriptions: many(notificationSubscriptions),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  opportunityAnalyses: many(opportunityAnalyses),
  supportSessions: many(supportSessions),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const knowledgeSourcesRelations = relations(knowledgeSources, ({ many }) => ({
  chunks: many(knowledgeChunks),
}));

export const knowledgeChunksRelations = relations(knowledgeChunks, ({ one }) => ({
  source: one(knowledgeSources, {
    fields: [knowledgeChunks.sourceId],
    references: [knowledgeSources.id],
  }),
}));

export const jobOpportunitiesRelations = relations(jobOpportunities, ({ many }) => ({
  opportunityAnalyses: many(opportunityAnalyses),
}));

export const opportunityAnalysesRelations = relations(opportunityAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [opportunityAnalyses.userId],
    references: [users.id],
  }),
  jobOpportunity: one(jobOpportunities, {
    fields: [opportunityAnalyses.jobOpportunityId],
    references: [jobOpportunities.id],
  }),
  conversation: one(conversations, {
    fields: [opportunityAnalyses.conversationId],
    references: [conversations.id],
  }),
}));

export const accommodationRequestsRelations = relations(accommodationRequests, ({ one }) => ({
  user: one(users, {
    fields: [accommodationRequests.userId],
    references: [users.id],
  }),
}));

export const supportSessionsRelations = relations(supportSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [supportSessions.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [supportSessions.conversationId],
    references: [conversations.id],
  }),
  consentRecords: many(consentRecords),
}));

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  user: one(users, {
    fields: [consentRecords.userId],
    references: [users.id],
  }),
  supportSession: one(supportSessions, {
    fields: [consentRecords.supportSessionId],
    references: [supportSessions.id],
  }),
}));

export const notificationSubscriptionsRelations = relations(
  notificationSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationSubscriptions.userId],
      references: [users.id],
    }),
  })
);

// ------------------------------------------------------------------------------
// Inferred TypeScript Model Types
// ------------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type KnowledgeSource = typeof knowledgeSources.$inferSelect;
export type NewKnowledgeSource = typeof knowledgeSources.$inferInsert;

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type NewKnowledgeChunk = typeof knowledgeChunks.$inferInsert;

export type JobOpportunity = typeof jobOpportunities.$inferSelect;
export type NewJobOpportunity = typeof jobOpportunities.$inferInsert;

export type OpportunityAnalysis = typeof opportunityAnalyses.$inferSelect;
export type NewOpportunityAnalysis = typeof opportunityAnalyses.$inferInsert;

export type AccommodationRequest = typeof accommodationRequests.$inferSelect;
export type NewAccommodationRequest = typeof accommodationRequests.$inferInsert;

export type SupportSession = typeof supportSessions.$inferSelect;
export type NewSupportSession = typeof supportSessions.$inferInsert;

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type NewConsentRecord = typeof consentRecords.$inferInsert;

export type NotificationSubscription = typeof notificationSubscriptions.$inferSelect;
export type NewNotificationSubscription = typeof notificationSubscriptions.$inferInsert;

