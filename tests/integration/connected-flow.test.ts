import { describe, it, expect, beforeEach } from 'vitest';
import { getRepository } from '@/lib/db';
import { seedDatabase } from '@/lib/db/seed';
import { retrieveRelevantChunks } from '@/lib/ai/rag/retriever';
import { buildGroundedContext } from '@/lib/ai/rag/context-builder';
import { OpportunityDecoderService } from '@/lib/ai/decoder.service';
import { AccommodationTranslatorService } from '@/lib/ai/translator.service';
import { SupportService } from '@/lib/services/support.service';
import { ConsentService } from '@/lib/services/consent.service';
import { NotificationService } from '@/lib/services/notification.service';
import { getRedis } from '@/lib/utils/redis';

describe('BridgeMate Full Connected User Journey Integration Test (Milestone 9)', () => {
  beforeEach(async () => {
    const repo = getRepository();
    if ('reset' in repo && typeof (repo as any).reset === 'function') {
      (repo as any).reset();
    }
    const redis = getRedis();
    await redis.flushall();
    await seedDatabase(repo);
  });

  it('executes the full 5-stage Connected Journey: Learn -> Decode -> Accommodate -> Live Help -> Discover & Alert', async () => {
    const repo = getRepository();

    // =========================================================================
    // STAGE 1: LEARN (Multilingual RAG & Statutory Citations)
    // =========================================================================
    // User asks in Amharic about employment rights under Proclamation 568/2008
    const queryAm = 'በኢትዮጵያ ሕግ መሠረት የአካል ጉዳተኞች የሥራ ስምሪት መብት እና ማመቻቸት ምን ይላል?';
    const retrieval = await retrieveRelevantChunks(queryAm, 0.1, 3);
    const ragContext = buildGroundedContext(retrieval.chunks);

    expect(ragContext.citations.length).toBeGreaterThan(0);
    expect(ragContext.promptContext.length).toBeGreaterThan(0);
    // Verifies statutory grounding in Ethiopian law
    expect(ragContext.promptContext).toMatch(/568\/2008|አዋጅ ቁጥር|ማመቻቸት/);

    // =========================================================================
    // STAGE 2: DECODE (Opportunity Decoder - Barrier Identification)
    // =========================================================================
    // User encounters an Ethiopian job posting with hidden physical barriers
    const jobText = `
      Position: Customer Data Analyst
      Company: Fintech Addis PLC
      Location: Addis Ababa, Kazanchis
      Requirements:
      - BSc in Computer Science or Statistics
      - 2 years experience in database management
      - Valid 3rd-grade Driving License required for transport
      - Frequent standing and lifting file boxes up to 15kg
      - Must submit hard-copy credentials in person on 4th floor
    `;

    const decoded = await OpportunityDecoderService.analyzeOpportunity(jobText);

    expect(decoded).toBeDefined();
    expect(decoded.potentialBarriers.length).toBeGreaterThan(0);
    // Verifies detection of non-essential physical barriers (driving license & lifting for desk analyst role)
    const barrierStr = JSON.stringify(decoded.potentialBarriers).toLowerCase();
    expect(barrierStr).toMatch(/መንጃ ፈቃድ|driving license|lifting|ተንቀሳቃሽነት/i);
    expect(decoded.summaryPlainLanguageAm.length).toBeGreaterThan(10);
    expect(decoded.summaryPlainLanguageEn.length).toBeGreaterThan(10);
    expect(decoded.potentialBarriers.length).toBeGreaterThan(0);

    // =========================================================================
    // STAGE 3: ACCOMMODATE (Accommodation Translator - No Medical Disclosure)
    // =========================================================================
    // User creates a professional accommodation request grounded in Proclamation 568/2008
    const accommodationDraft = await AccommodationTranslatorService.generateLetter({
      context: 'interview',
      functionalImpact: 'mobility',
      specificNeed: 'Interview room must be located on the ground floor with ramp access, or conducted virtually',
      tone: 'collaborative',
      candidateName: 'Yordanos Tesfaye',
      employerName: 'Fintech Addis PLC',
      jobTitle: 'Customer Data Analyst',
      language: 'am',
    });

    expect(accommodationDraft.status).toBe('draft');
    expect(accommodationDraft.subjectAm).toContain('568/2008');
    expect(accommodationDraft.letterBodyAm).toContain('Yordanos Tesfaye');
    expect(accommodationDraft.letterBodyAm).toContain('Fintech Addis PLC');
    expect(accommodationDraft.statutoryCitations.length).toBeGreaterThan(0);
    expect(accommodationDraft.statutoryCitations[0]).toContain('568/2008');
    // Ensure no medical diagnosis is deduced or requested
    const letterStr = (accommodationDraft.letterBodyAm + accommodationDraft.letterBodyEn).toLowerCase();
    expect(letterStr).not.toContain('medical condition');
    expect(letterStr).not.toContain('suffering from');
    expect(letterStr).not.toContain('patient');

    // =========================================================================
    // STAGE 4: LIVE HELP (Context-Preserving Handoff with Granular Consent)
    // =========================================================================
    // User escalates to human assistance. System creates structured handoff packet.
    const supportReq = {
      userGoal: 'Need help requesting elevator access on Fintech Addis application form',
      userLanguage: 'am' as const,
      disclosedAccommodations: ['Wheelchair accessible room / ground floor'],
      conversationHistorySummary: 'User inquired about Proclamation 568/2008 and decoded Fintech Addis posting',
      consentTranscript: true,
      consentAudio: false,
      consentScreenShare: false, // Affirmative default is false
    };

    const escalation = await SupportService.createSession(supportReq);

    expect(escalation.session.id).toBeDefined();
    expect(escalation.session.status).toBe('queued');
    expect(escalation.queuePosition).toBe(1);
    expect(escalation.estimatedWaitMinutes).toBe(2);

    // Verify Handoff Packet captures goal and recommended action without repeating
    const handoff = escalation.session.handoffPacket;
    expect(handoff?.userGoal).toContain('Fintech Addis');
    expect(handoff?.recommendedAgentAction).toBeDefined();

    // Verify screen share is blocked without explicit consent
    let screenShareAllowed = await ConsentService.isConsentGranted(
      escalation.session.id,
      'screen_share'
    );
    expect(screenShareAllowed).toBe(false);

    // User affirmatively grants screen share
    await ConsentService.recordConsent({
      sessionId: escalation.session.id,
      consentType: 'screen_share',
      granted: true,
    });
    screenShareAllowed = await ConsentService.isConsentGranted(
      escalation.session.id,
      'screen_share'
    );
    expect(screenShareAllowed).toBe(true);

    // Human navigator accepts session
    const acceptedSession = await SupportService.acceptSession(
      escalation.session.id,
      'navigator-selamawit'
    );
    expect(acceptedSession.status).toBe('active');

    // Verify live messaging in support room
    await SupportService.sendMessage(
      escalation.session.id,
      'agent',
      'ሰላም ዮርዳኖስ፣ የዐውደ-ጽሑፍ ማጠቃለያዎን አንብቤያለሁ። በፎርሙ ላይ ማመቻቸት መጠየቂያውን አብረን እንሞላዋለን።'
    );
    const roomMessages = await SupportService.getMessages(escalation.session.id);
    expect(roomMessages.some((m) => m.text.includes('ዮርዳኖስ'))).toBe(true);

    // =========================================================================
    // STAGE 5: DISCOVER & ALERT (Directory Filtering & SMS Dispatch)
    // =========================================================================
    // User queries verified inclusive jobs in Ethiopia
    const allJobs = await repo.jobs.list();
    expect(allJobs.length).toBeGreaterThanOrEqual(5);

    // Filter by remote
    const remoteJobs = await repo.jobs.list({ isRemote: true });
    expect(remoteJobs.length).toBeGreaterThan(0);
    expect(remoteJobs.every((j) => j.parsedData?.isRemote === true)).toBe(true);

    // User subscribes for SMS notifications
    const subResult = await NotificationService.subscribe({
      phoneNumber: '0911554433',
      channel: 'sms',
      categories: ['tech'],
      disabilityCategories: ['mobility'],
      language: 'am',
    });

    expect(subResult.subscription.phoneNumber).toBe('+251911554433');
    expect(subResult.sendResult.success).toBe(true);
    expect(subResult.sendResult.recipient).toBe('+251911554433');
    expect(subResult.sendResult.provider).toBe('sandbox');
  });
});
