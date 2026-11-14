import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/v1-auth';
import { SupportService } from '@/lib/services/support.service';
import { CreateSupportRequestSchema } from '@/lib/validators/support.schema';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/support',
    description: 'BridgeMate Live Help Escalation API — Enqueues users with full structured context handoff packets for human assistance.',
    authentication: 'Optional x-api-key or Authorization: Bearer <key> (Use demo_key_alx_2026)',
    version: '1.0.0',
  });
}

export async function POST(req: NextRequest) {
  const auth = validateApiKey(req);
  if (!auth.authenticated) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: auth.error },
      },
      { status: 401 }
    );
  }

  try {
    const json = await req.json();
    const parsed = CreateSupportRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid support escalation payload.',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const result = await SupportService.createSession(parsed.data);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.session.id,
        status: result.session.status,
        queuePosition: result.queuePosition,
        estimatedWaitMinutes: result.estimatedWaitMinutes,
        screenShareEnabled: result.session.screenShareEnabled,
        handoffPacket: result.session.handoffPacket,
        joinUrl: `/support?sessionId=${result.session.id}`,
      },
      meta: {
        apiVersion: 'v1',
        authTier: auth.keyType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[API v1 Support Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err?.message || 'Support service failure' },
      },
      { status: 500 }
    );
  }
}
