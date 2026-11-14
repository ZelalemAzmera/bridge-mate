import { NextRequest, NextResponse } from 'next/server';
import { ConsentService } from '@/lib/services/consent.service';
import { UpdateConsentSchema } from '@/lib/validators/support.schema';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const json = await req.json();
    const parsed = UpdateConsentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid consent data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const record = await ConsentService.recordConsent({
      sessionId,
      consentType: parsed.data.consentType,
      granted: parsed.data.granted,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: {
        consentId: record.id,
        consentType: record.consentType,
        granted: record.granted,
      },
    });
  } catch (error: any) {
    console.error('[Support Consent API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to record consent', message: error.message },
      { status: 500 }
    );
  }
}

