import { NextRequest, NextResponse } from 'next/server';
import { TelegramService, type TelegramUpdate } from '@/lib/telegram/telegram.service';

export const runtime = 'nodejs';

/**
 * Telegram Bot Webhook Endpoint
 * Spec: Telegram Bot API v7.0
 * Route: /api/telegram/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();

    if (!update || !update.update_id) {
      return NextResponse.json({ ok: false, error: 'Invalid Telegram update payload' }, { status: 400 });
    }

    const result = await TelegramService.processUpdate(update);

    return NextResponse.json({
      ok: true,
      handled: result.handled,
      replyPreview: result.replyText.slice(0, 100),
    });
  } catch (err: any) {
    console.error('[Telegram Webhook Error]:', err);
    return NextResponse.json(
      { ok: false, error: 'Webhook processing error', details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const outgoing = TelegramService.getOutgoingLog();
  const botConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);

  return NextResponse.json({
    status: 'online',
    botName: '@BridgeMateAssistantBot',
    mode: botConfigured ? 'live_webhook' : 'sandbox_simulation',
    track: 'Track 3: Multilingual Assistant and Live Help',
    supportedCommands: ['/start', '/help', '/ask', '/decode', '/livehelp', '/alerts'],
    recentOutgoingCount: outgoing.length,
    recentLog: outgoing.slice(0, 5),
  });
}
