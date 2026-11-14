import { getRepository } from '@/lib/db';
import type { ConsentRecord } from '@/lib/db/schema';

export class ConsentService {
  /**
   * Records or updates a granular user consent setting.
   */
  public static async recordConsent(params: {
    sessionId: string;
    userId?: string;
    consentType: 'screen_share' | 'transcript' | 'transcript_sharing' | 'audio_recording';
    granted: boolean;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ConsentRecord> {
    const repo = getRepository();

    const record = await repo.support.recordConsent({
      sessionId: params.sessionId,
      supportSessionId: params.sessionId,
      userId: params.userId || null,
      consentType: params.consentType,
      granted: params.granted,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      timestamp: new Date(),
    });

    // If this is screen_share consent, mirror to the support_sessions table flag
    if (params.consentType === 'screen_share') {
      const session = await repo.support.getSession(params.sessionId);
      if (session) {
        session.screenShareEnabled = params.granted;
      }
    }

    return record;
  }

  /**
   * Checks whether a specific consent is active for a session.
   */
  public static async isConsentGranted(
    sessionId: string,
    consentType: 'screen_share' | 'transcript' | 'transcript_sharing' | 'audio_recording'
  ): Promise<boolean> {
    const repo = getRepository();
    const session = await repo.support.getSession(sessionId);
    if (!session) return false;

    if (consentType === 'screen_share') {
      return Boolean(session.screenShareEnabled);
    }

    return true;
  }
}

