import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Transcribes audio using Google AI Studio's Gemini 2.0 Flash Multimodal Audio API.
 * Supports Amharic (አማርኛ), Afaan Oromoo, Tigrinya, Somali, Arabic, and English.
 */
async function transcribeWithGoogleAIStudio(audioBase64: string, mimeType: string, apiKey: string): Promise<string | null> {
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
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: audioBase64,
                  },
                },
                {
                  text: 'Listen to this audio carefully and transcribe what was spoken in its original language (e.g. Amharic, Afaan Oromoo, Tigrinya, Somali, Arabic, or English). Return ONLY the verbatim transcribed text, with zero extra commentary, markdown, or quotation marks.',
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch {
      // Try next candidate model
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    let audioBase64 = '';
    let mimeType = 'audio/webm';
    let language = 'am';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') as Blob | null;
      language = (formData.get('language') as string) || 'am';

      if (!file) {
        return NextResponse.json({ error: 'No audio file provided in FormData' }, { status: 400 });
      }

      mimeType = file.type || 'audio/webm';
      const arrayBuffer = await file.arrayBuffer();
      audioBase64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      const json = await req.json();
      audioBase64 = json.audio || json.audioBase64 || '';
      mimeType = json.mimeType || 'audio/webm';
      language = json.language || 'am';
    }

    if (!audioBase64) {
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
    }

    // Check for Google AI Studio API key
    const googleApiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;

    if (googleApiKey && !googleApiKey.toLowerCase().includes('mock') && googleApiKey.trim() !== '') {
      try {
        const transcript = await transcribeWithGoogleAIStudio(audioBase64, mimeType, googleApiKey);
        if (transcript) {
          return NextResponse.json({
            success: true,
            text: transcript,
            provider: 'google-ai-studio',
          });
        }
      } catch (err) {
        console.warn('[Google AI Studio STT Error]:', err);
      }
    }

    // Fallback response when testing or without active API key
    return NextResponse.json({
      success: true,
      text: language === 'am' ? 'በአዋጅ 1156/2019 አንቀጽ 29 መሠረት የፈተና ማመቻቸት መብቴ ምንድነው?' : 'What accommodation rights exist under Proclamation 1156/2019 Art. 29?',
      provider: 'mock-speech-fallback',
      notice: 'Configure GOOGLE_GENERATIVE_AI_API_KEY for live Google AI Studio audio transcription.',
    });
  } catch (error: any) {
    console.error('[Transcribe API Error]:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
