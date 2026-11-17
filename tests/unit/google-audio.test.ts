import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getTts } from '@/app/api/tts/route';
import { POST as postTranscribe } from '@/app/api/transcribe/route';
import { TelegramService } from '@/lib/telegram/telegram.service';

describe('Google AI Studio Audio (TTS & STT) Integration', () => {
  it('GET /api/tts handles speech synthesis requests with valid audio headers', async () => {
    const req = new NextRequest('http://localhost:3000/api/tts?lang=am&text=ሰላም%20ብሪጅሜት');
    const res = await getTts(req);

    expect([200, 307]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('Content-Type')).toMatch(/audio\/(mpeg|wav)/);
    } else {
      expect(res.headers.get('location')).toContain('translate.google.com');
    }
  });

  it('GET /api/tts returns 400 when text query parameter is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/tts?lang=am&text=');
    const res = await getTts(req);

    expect(res.status).toBe(400);
  });

  it('GET /api/tts synthesizes speech via Hasab AI when HASAB_API_KEY is configured', async () => {
    process.env.HASAB_API_KEY = 'test_hasab_key';
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      arrayBuffer: async () => Buffer.from('RIFF$   WAVEfmt     \x10   \x01 \x01 D\xac  D\xac  \x01 \x08 data    '),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/tts?lang=am&text=ሰላም');
    const res = await getTts(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-TTS-Provider')).toMatch(/hasab-ai/);
    expect(res.headers.get('Content-Type')).toBe('audio/wav');

    global.fetch = originalFetch;
    delete process.env.HASAB_API_KEY;
  });

  it('GET /api/tts falls back to Google AI Studio Gemini TTS when Hasab is unavailable', async () => {
    delete process.env.HASAB_API_KEY;
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test_google_key';
    const originalFetch = global.fetch;

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/wav',
                    data: Buffer.from('RIFF$   WAVEfmt     \x10   \x01 \x01 D\xac  D\xac  \x01 \x08 data    ').toString('base64'),
                  },
                },
              ],
            },
          },
        ],
      }),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/tts?lang=am&text=በአዋጅ%201156%20አንቀጽ%2029%20መሠረት');
    const res = await getTts(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-TTS-Provider')).toBe('google-ai-studio');
    expect(res.headers.get('Content-Type')).toBe('audio/wav');

    global.fetch = originalFetch;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  });

  it('POST /api/transcribe processes audio with Hasab AI when HASAB_API_KEY is set', async () => {
    process.env.HASAB_API_KEY = 'test_hasab_key';
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, transcription: 'ሰላም ብሪጅሜት' }),
    } as any);

    const req = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio: Buffer.from('fake-audio-bytes').toString('base64'),
        mimeType: 'audio/webm',
        language: 'am',
      }),
    });

    const res = await postTranscribe(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.provider).toBe('hasab-ai');
    expect(data.text).toBe('ሰላም ብሪጅሜት');

    global.fetch = originalFetch;
    delete process.env.HASAB_API_KEY;
  });

  it('GET /api/tts redirects to direct stream when serverless proxy fetch fails', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Vercel IP Blocked'));

    const req = new NextRequest('http://localhost:3000/api/tts?lang=am&text=ፈተና');
    const res = await getTts(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('translate.google.com/translate_tts');

    global.fetch = originalFetch;
  });

  it('POST /api/transcribe accepts audio payload and returns transcription', async () => {
    const req = new NextRequest('http://localhost:3000/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio: Buffer.from('fake-audio-bytes').toString('base64'),
        mimeType: 'audio/webm',
        language: 'am',
      }),
    });

    const res = await postTranscribe(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.text).toBeTruthy();
    expect(data.provider).toBeTruthy();
  });

  it('TelegramService handles incoming voice notes by transcribing audio', async () => {
    const update = {
      update_id: 888222,
      message: {
        message_id: 101,
        chat: { id: 771122, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        voice: {
          file_id: 'voice_note_test_123',
          duration: 3,
          mime_type: 'audio/ogg',
        },
      },
    };

    const res = await TelegramService.processUpdate(update as any);
    expect(res.handled).toBe(true);
    expect(res.replyText).toBeTruthy();
  });
});
