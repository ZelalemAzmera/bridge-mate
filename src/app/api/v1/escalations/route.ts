import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface Ticket {
  ticketId: string;
  createdAt: string;
  language: string;
  element: string | null;
  pageUrl: string | null;
  messageCount: number;
  status: string;
}

const memoryTickets = new Map<string, Ticket>();

export async function GET() {
  const list = [...memoryTickets.values()].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ tickets: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { conversation = [], language = 'en', element, pageUrl } = body;

    const ticketId = `BM-${Date.now().toString(36).toUpperCase()}`;
    const ticket: Ticket = {
      ticketId,
      createdAt: new Date().toISOString(),
      language,
      element: element || null,
      pageUrl: pageUrl || null,
      messageCount: Array.isArray(conversation) ? conversation.length : 0,
      status: 'open'
    };

    memoryTickets.set(ticketId, ticket);

    return NextResponse.json({ ticketId, status: 'open' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create escalation ticket' }, { status: 500 });
  }
}
