import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    let question = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      question = (body.text || body.Body || body.message || '').trim();
    } else {
      const raw = await req.text();
      question = raw.trim();
    }

    if (!question) {
      return new NextResponse('Send a question. Example: WCAG keyboard?', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // Generate grounded plain text response
    let reply = `BridgeMate: Proclamation 1156/2019 Art. 29 guarantees reasonable adjustments without medical disclosure. For help, contact your tutor.`;
    if (/virtual assistant|va|career|future/i.test(question)) {
      reply = `BridgeMate VA: AI is transforming VA roles. Learn AI tools and specialize in a niche to thrive. See Savanna VA module.`;
    }

    const truncated = reply.slice(0, 155) + (reply.length > 155 ? '…' : '');
    return new NextResponse(truncated, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (err: any) {
    return new NextResponse('BridgeMate SMS error. Try again.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
