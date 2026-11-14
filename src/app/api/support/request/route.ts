import { NextRequest, NextResponse } from 'next/server';
import { SupportService } from '@/lib/services/support.service';
import { CreateSupportRequestSchema } from '@/lib/validators/support.schema';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CreateSupportRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid support request payload.',
          details: parsed.error.flatten(),
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
        handoffPacket: result.session.handoffPacket,
        screenShareEnabled: result.session.screenShareEnabled,
      },
    });
  } catch (error: any) {
    console.error('[Support Request API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to initiate support request.', message: error.message },
      { status: 500 }
    );
  }
}

