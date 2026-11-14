import { NextRequest, NextResponse } from 'next/server';
import { SupportService } from '@/lib/services/support.service';
import { SendSupportMessageSchema } from '@/lib/validators/support.schema';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const messages = await SupportService.getMessages(sessionId);
    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error('[Support Get Messages API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve messages', message: error.message },
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
    const json = await req.json();
    const parsed = SendSupportMessageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid message payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const msg = await SupportService.sendMessage(
      sessionId,
      parsed.data.sender,
      parsed.data.text
    );

    return NextResponse.json({ success: true, data: msg });
  } catch (error: any) {
    console.error('[Support Send Message API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to send message', message: error.message },
      { status: 500 }
    );
  }
}

