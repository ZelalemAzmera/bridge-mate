import { getRepository } from '@/lib/db';
import { getRedis } from '@/lib/utils/redis';
import { HandoffService } from '@/lib/ai/handoff.service';
import { ConsentService } from '@/lib/services/consent.service';
import type { CreateSupportRequest, HandoffPacket } from '@/lib/validators/support.schema';
import type { SupportSession } from '@/lib/db/schema';

export interface SupportMessageItem {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
}

export class SupportService {
  private static QUEUE_KEY = 'support:queue';
  private static queueSequence = 0;

  /**
   * Creates a new support escalation session.
   */
  public static async createSession(
    req: CreateSupportRequest,
    userId?: string
  ): Promise<{
    session: SupportSession;
    queuePosition: number;
    estimatedWaitMinutes: number;
  }> {
    const repo = getRepository();
    const redis = getRedis();

    // 1. Generate Context Handoff Packet
    const handoffPacket: HandoffPacket = await HandoffService.generatePacket(
      req,
      req.conversationHistorySummary || ''
    );

    // 2. Persist Support Session
    const session = await repo.support.createSession({
      userId: userId || null,
      conversationId: req.conversationId || null,
      channel: 'web',
      status: 'queued',
      handoffPacket,
      screenShareEnabled: req.consentScreenShare,
      structuredPacket: handoffPacket,
    });

    // 3. Record Initial Consents
    await ConsentService.recordConsent({
      sessionId: session.id,
      userId,
      consentType: 'transcript_sharing',
      granted: req.consentTranscript,
    });

    if (req.consentAudio) {
      await ConsentService.recordConsent({
        sessionId: session.id,
        userId,
        consentType: 'audio_recording',
        granted: true,
      });
    }

    if (req.consentScreenShare) {
      await ConsentService.recordConsent({
        sessionId: session.id,
        userId,
        consentType: 'screen_share',
        granted: true,
      });
    }

    // 4. Enqueue into Redis sorted set with monotonic score to preserve strict FIFO
    const monotonicScore = Date.now() * 1000 + (++this.queueSequence);
    await redis.zadd(this.QUEUE_KEY, { score: monotonicScore, member: session.id });

    // 5. Calculate queue rank
    const rank = await redis.zrank(this.QUEUE_KEY, session.id);
    const queuePosition = rank !== null ? rank + 1 : 1;
    const estimatedWaitMinutes = queuePosition * 2;

    // 6. Push welcome system message to live chat list
    const welcomeMsg: SupportMessageItem = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text:
        req.userLanguage === 'am'
          ? 'የድጋፍ ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል። የሰው ድጋፍ ሰጪ እስኪገናኝዎት ድረስ እባክዎ ይጠብቁ...'
          : 'Your support request has been queued. A specialist will join your room shortly...',
      timestamp: new Date().toISOString(),
    };
    await redis.lpush(`support:messages:${session.id}`, JSON.stringify(welcomeMsg));

    return {
      session,
      queuePosition,
      estimatedWaitMinutes,
    };
  }

  /**
   * Gets current session details, queue position, and estimated wait time.
   */
  public static async getSessionStatus(sessionId: string): Promise<{
    session: SupportSession | null;
    queuePosition: number;
    estimatedWaitMinutes: number;
  }> {
    const repo = getRepository();
    const redis = getRedis();

    const session = await repo.support.getSession(sessionId);
    if (!session) {
      return { session: null, queuePosition: 0, estimatedWaitMinutes: 0 };
    }

    if (session.status === 'queued') {
      const rank = await redis.zrank(this.QUEUE_KEY, sessionId);
      const queuePosition = rank !== null ? rank + 1 : 1;
      const estimatedWaitMinutes = queuePosition * 2;
      return { session, queuePosition, estimatedWaitMinutes };
    }

    return { session, queuePosition: 0, estimatedWaitMinutes: 0 };
  }

  /**
   * Accepts a support session by an agent.
   */
  public static async acceptSession(
    sessionId: string,
    agentId: string = 'agent-bridge-ethiopia'
  ): Promise<SupportSession> {
    const repo = getRepository();
    const redis = getRedis();

    const session = await repo.support.updateStatus(sessionId, 'active', agentId);
    await redis.zrem(this.QUEUE_KEY, sessionId);

    // Push agent join notification
    const joinMsg: SupportMessageItem = {
      id: `sys-join-${Date.now()}`,
      sender: 'system',
      text:
        session.channel === 'web'
          ? 'የሰው ድጋፍ ሰጪ ተገናኝቷል! የቀረበውን የዐውደ-ጽሑፍ ማጠቃለያ አንብበው ዝግጁ ሆነዋል።'
          : 'Human Specialist connected! They have received your context handoff summary and are ready to assist.',
      timestamp: new Date().toISOString(),
    };
    await redis.lpush(`support:messages:${sessionId}`, JSON.stringify(joinMsg));

    return session;
  }

  /**
   * Closes a support session.
   */
  public static async closeSession(sessionId: string): Promise<SupportSession> {
    const repo = getRepository();
    const redis = getRedis();

    const session = await repo.support.updateStatus(sessionId, 'closed');
    await redis.zrem(this.QUEUE_KEY, sessionId);
    return session;
  }

  /**
   * Sends a message in the live support room.
   */
  public static async sendMessage(
    sessionId: string,
    sender: 'user' | 'agent',
    text: string
  ): Promise<SupportMessageItem> {
    const redis = getRedis();
    const msg: SupportMessageItem = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
    };

    await redis.lpush(`support:messages:${sessionId}`, JSON.stringify(msg));
    return msg;
  }

  /**
   * Retrieves messages for a support room.
   */
  public static async getMessages(sessionId: string): Promise<SupportMessageItem[]> {
    const redis = getRedis();
    const raw = await redis.lrange(`support:messages:${sessionId}`, 0, 100);

    return raw
      .map((item) => {
        try {
          return typeof item === 'string' ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter((m): m is SupportMessageItem => m !== null)
      .reverse(); // chronological order
  }
}

