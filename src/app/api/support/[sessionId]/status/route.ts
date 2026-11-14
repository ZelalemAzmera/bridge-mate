import { NextRequest, NextResponse } from 'next/server';
import { SupportService } from '@/lib/services/support.service';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const statusData = await SupportService.getSessionStatus(sessionId);

    if (!statusData.session) {
      return NextResponse.json(
        { error: 'Support session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: statusData.session.id,
        status: statusData.session.status,
        agentId: statusData.session.agentId || statusData.session.assignedAgentId,
        queuePosition: statusData.queuePosition,
        estimatedWaitMinutes: statusData.estimatedWaitMinutes,
        screenShareEnabled: statusData.session.screenShareEnabled,
        handoffPacket: statusData.session.handoffPacket,
        startedAt: statusData.session.startedAt,
        closedAt: statusData.session.closedAt,
      },
    });
  } catch (error: any) {
    console.error('[Support Status API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session status', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'accept';

    if (action === 'accept') {
      const updated = await SupportService.acceptSession(
        sessionId,
        body.agentId || 'human-navigator-1'
      );
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'close') {
      const updated = await SupportService.closeSession(sessionId);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Support Action API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to update session state', message: error.message },
      { status: 500 }
    );
  }
}

