import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const lang = searchParams.get('lang') || 'am';

    if (!text.trim()) {
      return new NextResponse('Text is required', { status: 400 });
    }

    // Truncate to first 200 chars for responsive phrase TTS
    const sanitizedText = text.slice(0, 200).trim();
    const ttsLang = lang === 'en' ? 'en' : 'am';
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${ttsLang}&q=${encodeURIComponent(sanitizedText)}`;

    const response = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch TTS stream', { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('[TTS API Error]:', error);
    return new NextResponse('TTS processing failed', { status: 500 });
  }
}
