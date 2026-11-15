import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Wraps raw 16-bit mono 24kHz PCM buffer from Gemini 2.0 Flash Audio in a standard RIFF WAV header
 * so that any browser or HTML5 <audio> element plays it natively without client-side decoding.
 */
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const wavHeader = Buffer.alloc(44);

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20); // Audio format 1 = PCM
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

/**
 * Attempts to generate natural, expressive speech via Google AI Studio's Gemini 2.0 Flash Audio output.
 * Tries primary and experimental checkpoints for maximum availability.
 */
async function generateGoogleAIStudioAudio(text: string, lang: string, apiKey: string): Promise<Buffer | null> {
  const langNames: Record<string, string> = {
    am: 'Amharic (አማርኛ)',
    om: 'Afaan Oromoo',
    ti: 'Tigrinya (ትግርኛ)',
    so: 'Somali',
    ar: 'Arabic',
    en: 'English',
  };
  const languageName = langNames[lang] || 'Amharic';

  const prompt = `You are a supportive, warm accessibility learning tutor for Ethiopian students. Please read aloud the following text in ${languageName} with clear articulation, natural breathing, and a warm tone. Speak ONLY the exact words provided without preamble, commentary, or quotes:\n\n"${text}"`;

  const candidateModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp'];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck', // Natural, warm conversational voice
                },
              },
            },
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const part = data.candidates?.[0]?.content?.parts?.[0];
      if (!part || !part.inlineData || !part.inlineData.data) {
        continue;
      }

      const rawBytes = Buffer.from(part.inlineData.data, 'base64');
      const mimeType = part.inlineData.mimeType || '';

      // If Gemini returns raw PCM, prepend standard WAV header
      if (mimeType.includes('pcm') || !mimeType.includes('wav')) {
        return pcmToWav(rawBytes, 24000);
      }

      return rawBytes;
    } catch {
      // Continue to next candidate model or fallback
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const lang = searchParams.get('lang') || 'am';

    if (!text.trim()) {
      return new NextResponse('Text is required', { status: 400 });
    }

    // Truncate to first 300 chars for responsive phrase TTS
    const sanitizedText = text
      .replace(/\[Source:.*?\]/g, '')
      .replace(/[*_#`~>]/g, '')
      .trim()
      .slice(0, 300);

    // 1. TIER 1: Google AI Studio Gemini 2.0 Flash Audio (if API key is configured)
    const googleApiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;

    if (googleApiKey && !googleApiKey.toLowerCase().includes('mock') && googleApiKey.trim() !== '') {
      try {
        const studioAudio = await generateGoogleAIStudioAudio(sanitizedText, lang, googleApiKey);
        if (studioAudio && studioAudio.length > 0) {
          return new NextResponse(new Uint8Array(studioAudio), {
            headers: {
              'Content-Type': 'audio/wav',
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
              'X-TTS-Provider': 'google-ai-studio',
            },
          });
        }
      } catch (err) {
        console.warn('[Google AI Studio TTS Fallback Triggered]:', err);
      }
    }

    // 2. TIER 2: Fast, Zero-Key Google Translate Edge Stream
    const ttsLang = lang === 'en' ? 'en' : 'am';
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${ttsLang}&q=${encodeURIComponent(sanitizedText)}`;

    try {
      const response = await fetch(googleTtsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            'X-TTS-Provider': 'google-translate-edge',
          },
        });
      }
    } catch (err) {
      console.warn('[TTS Server Edge Fetch Error]:', err);
    }

    // 3. TIER 3: Client Direct Stream Redirect (bypasses serverless datacenter IP blocks)
    return NextResponse.redirect(googleTtsUrl, 307);
  } catch (error: any) {
    console.error('[TTS API Error]:', error);
    // Even on server exception, redirect client to public TTS stream so audio never fails silently
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const lang = searchParams.get('lang') || 'am';
    const safeText = encodeURIComponent(text.slice(0, 200));
    return NextResponse.redirect(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${safeText}`, 307);
  }
}
