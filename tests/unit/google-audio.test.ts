import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getTts } from '@/app/api/tts/route';
import { POST as postTranscribe } from '@/app/api/transcribe/route';
import { TelegramService } from '@/lib/telegram/telegram.service';

describe('Google AI Studio Audio (TTS & STT) Integration', () => {
  it('GET /api/tts handles speech synthesis requests with valid audio headers', async () => {
    const req = new NextRequest('http://localhost:3000/api/tts?lang=am&text=ሰላም%20ብሪጅሜት');
    const res = await getTts(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toMatch(/audio\/(mpeg|wav)/);
    expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
  });

  it('GET /api/tts returns 400 when text query parameter is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/tts?lang=am&text=');
    const res = await getTts(req);

    expect(res.status).toBe(400);
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
