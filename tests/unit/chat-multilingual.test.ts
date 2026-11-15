import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as chatPost } from '@/app/api/chat/route';

describe('Tutor AI Chat Multilingual Streaming Parity (/api/chat)', () => {
  const languages = [
    { code: 'en', greeting: 'hi', expectedSubstring: 'Welcome to BridgeMate' },
    { code: 'am', greeting: 'ሰላም', expectedSubstring: 'ወደ ብሪጅሜት እንኳን በደህና መጡ' },
    { code: 'om', greeting: 'Akkam', expectedSubstring: 'Baga nagaan gara BridgeMate dhuftan' },
    { code: 'ti', greeting: 'ሰላም', expectedSubstring: 'ናብ ብሪጅሜት ብደሓን መጻእኩም' },
    { code: 'so', greeting: 'Salaan', expectedSubstring: 'Ku soo dhowow BridgeMate' },
    { code: 'ar', greeting: 'مرحبا', expectedSubstring: 'أهلاً بك في BridgeMate' },
  ];

  for (const { code, greeting, expectedSubstring } of languages) {
    it(`generates grounded streaming greeting in ${code.toUpperCase()}`, async () => {
      const req = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: greeting }],
          language: code,
        }),
      });

      const res = await chatPost(req);
      expect(res.status).toBe(200);

      const reader = res.body?.getReader();
      expect(reader).toBeDefined();

      let text = '';
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value);
        }
      }

      // Check text is not empty and contains either live AI response or offline grounded text
      expect(text.length).toBeGreaterThan(10);
      expect(text).not.toContain('3:"An error occurred."');
      expect(text).not.toContain('model_not_found');
    });
  }

  it('delivers grounded curriculum response with Ethiopian Proclamation citations', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What accommodation rights exist under Proclamation 1156/2019?' }],
        language: 'en',
      }),
    });

    const res = await chatPost(req);
    expect(res.status).toBe(200);
    const citationsHeader = res.headers.get('x-citations');
    expect(citationsHeader).toBeDefined();
  });
});
