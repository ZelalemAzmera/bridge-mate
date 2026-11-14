import { describe, it, expect, beforeEach } from 'vitest';
import {
  CreateSupportRequestSchema,
  UpdateConsentSchema,
} from '@/lib/validators/support.schema';
import { HandoffService } from '@/lib/ai/handoff.service';
import { SupportService } from '@/lib/services/support.service';
import { ConsentService } from '@/lib/services/consent.service';
import { getRepository } from '@/lib/db';
import { getRedis } from '@/lib/utils/redis';

describe('Human Support & Context-Preserving Handoff (Milestone 6)', () => {
  beforeEach(async () => {
    const repo = getRepository();
    if ('reset' in repo && typeof (repo as any).reset === 'function') {
      (repo as any).reset();
    }
    const redis = getRedis();
    await redis.flushall();
  });

  it('validates support escalation request payload', () => {
    const valid = {
      userGoal: 'Need help navigating the Commercial Bank of Ethiopia exam portal with NVDA',
      userLanguage: 'am',
      disclosedAccommodations: ['Screen reader user'],
      consentTranscript: true,
      consentAudio: false,
      consentScreenShare: false,
    };

    const res = CreateSupportRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.consentScreenShare).toBe(false);
      expect(res.data.consentTranscript).toBe(true);
    }
  });

  it('rejects an empty user goal', () => {
    const invalid = {
      userGoal: '',
      userLanguage: 'en',
    };
    const res = CreateSupportRequestSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('generates a 4-part Handshake Packet with zero medical speculation', async () => {
    const req = {
      userGoal: 'I need assistance requesting extra time on my online accounting exam',
      userLanguage: 'en' as const,
      disclosedAccommodations: ['Low vision - 24pt large font'],
      consentTranscript: true,
      consentAudio: false,
      consentScreenShare: false,
    };

    const packet = await HandoffService.generatePacket(req);
    expect(packet.userGoal).toBe(req.userGoal);
    expect(packet.disclosedAccommodations).toContain('Low vision - 24pt large font');
    expect(packet.recommendedAgentAction).toBeDefined();
    expect(packet.recommendedAgentAction.length).toBeGreaterThan(10);

    // Verify social model: no medical diagnosis deduction
    const packetStr = JSON.stringify(packet).toLowerCase();
    expect(packetStr).not.toContain('suffering');
    expect(packetStr).not.toContain('patient');
    expect(packetStr).not.toContain('disease');
  });

  it('enqueues a support session into Redis and computes queue rank', async () => {
    const req1 = {
      userGoal: 'First user in queue',
      userLanguage: 'am' as const,
      disclosedAccommodations: [],
      consentTranscript: true,
      consentAudio: false,
      consentScreenShare: false,
    };

    const res1 = await SupportService.createSession(req1);
    expect(res1.session.id).toBeDefined();
    expect(res1.session.status).toBe('queued');
    expect(res1.queuePosition).toBe(1);
    expect(res1.estimatedWaitMinutes).toBe(2);

    const req2 = {
      userGoal: 'Second user in queue',
      userLanguage: 'en' as const,
      disclosedAccommodations: [],
      consentTranscript: true,
      consentAudio: false,
      consentScreenShare: false,
    };

    const res2 = await SupportService.createSession(req2);
    expect(res2.queuePosition).toBe(2);
    expect(res2.estimatedWaitMinutes).toBe(4);
  });

  it('enforces granular consent: screen share is disabled until affirmatively granted', async () => {
    const req = {
      userGoal: 'Need help with form upload',
      userLanguage: 'am' as const,
      disclosedAccommodations: [],
      consentTranscript: true,
      consentAudio: false,
      consentScreenShare: false, // default unchecked
    };

    const created = await SupportService.createSession(req);
    const initialScreenConsent = await ConsentService.isConsentGranted(
      created.session.id,
      'screen_share'
    );
    expect(initialScreenConsent).toBe(false);

    // User affirmatively grants consent
    await ConsentService.recordConsent({
      sessionId: created.session.id,
      consentType: 'screen_share',
      granted: true,
    });

    const updatedScreenConsent = await ConsentService.isConsentGranted(
      created.session.id,
      'screen_share'
    );
    expect(updatedScreenConsent).toBe(true);
  });

  it('transitions session to active upon agent acceptance and logs chat messages', async () => {
    const req = {
      userGoal: 'Testing live chat escalation',
      userLanguage: 'am' as const,
      disclosedAccommodations: [],
      consentTranscript: true,
      consentAudio: false,
      consentScreenShare: false,
    };

    const created = await SupportService.createSession(req);
    const accepted = await SupportService.acceptSession(
      created.session.id,
      'navigator-selamawit'
    );

    expect(accepted.status).toBe('active');
    expect(accepted.agentId).toBe('navigator-selamawit');

    // Status query reflects active status
    const status = await SupportService.getSessionStatus(created.session.id);
    expect(status.session?.status).toBe('active');
    expect(status.queuePosition).toBe(0);

    // Send user and agent messages
    await SupportService.sendMessage(created.session.id, 'user', 'ሰላም፣ ፎርሙ አልሞላ ብሎኛል');
    await SupportService.sendMessage(created.session.id, 'agent', 'እንደምን አደሩ፣ የዐውደ-ጽሑፍ ማጠቃለያዎን አንብቤያለሁ፣ በጋራ እንፈታዋለን');

    const messages = await SupportService.getMessages(created.session.id);
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages.some((m) => m.text.includes('ሰላም፣ ፎርሙ አልሞላ ብሎኛል'))).toBe(true);
    expect(messages.some((m) => m.text.includes('እንደምን አደሩ'))).toBe(true);
  });
});
