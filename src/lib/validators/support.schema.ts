import { z } from 'zod';

export const HandoffPacketSchema = z.object({
  userGoal: z.string().min(1, 'User goal is required'),
  disclosedAccommodations: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  attemptedActions: z.array(z.string()).default([]),
  recommendedAgentAction: z.string().min(1, 'Recommended agent action is required'),
});

export type HandoffPacket = z.infer<typeof HandoffPacketSchema>;

export const CreateSupportRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  userGoal: z.string().min(1, 'Please describe what you need assistance with').max(1000).default('General assistance request'),
  userLanguage: z.enum(['am', 'en', 'om', 'ti', 'so']).default('en'),
  disclosedAccommodations: z.array(z.string()).optional().default([]),
  conversationHistorySummary: z.string().optional(),
  consentTranscript: z.boolean().default(true),
  consentAudio: z.boolean().default(false),
  consentScreenShare: z.boolean().default(false),
});

export type CreateSupportRequest = z.infer<typeof CreateSupportRequestSchema>;

export const UpdateConsentSchema = z.object({
  consentType: z.enum(['screen_share', 'transcript', 'transcript_sharing', 'audio_recording']),
  granted: z.boolean(),
});

export type UpdateConsentRequest = z.infer<typeof UpdateConsentSchema>;

export const SendSupportMessageSchema = z.object({
  sender: z.enum(['user', 'agent']),
  text: z.string().min(1, 'Message cannot be empty').max(2000),
});

export type SendSupportMessage = z.infer<typeof SendSupportMessageSchema>;

