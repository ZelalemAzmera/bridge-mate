import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { validateApiKey } from '@/lib/api/v1-auth';
import { POST as chatPost, GET as chatGet } from '@/app/api/v1/chat/route';
import { POST as decoderPost, GET as decoderGet } from '@/app/api/v1/decoder/route';
import { POST as translatorPost, GET as translatorGet } from '@/app/api/v1/translator/route';
import { POST as supportPost, GET as supportGet } from '@/app/api/v1/support/route';

describe('BridgeMate Level 2 REST APIs (/api/v1/*)', () => {
  describe('API Key Authentication Helper (validateApiKey)', () => {
    it('approves evaluation demo key demo_key_alx_2026', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/chat', {
        headers: { 'x-api-key': 'demo_key_alx_2026' },
      });
      const result = validateApiKey(req);
      expect(result.authenticated).toBe(true);
      expect(result.keyType).toBe('demo');
    });

    it('approves Authorization: Bearer demo key', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/chat', {
        headers: { authorization: 'Bearer demo_key_alx_2026' },
      });
      const result = validateApiKey(req);
      expect(result.authenticated).toBe(true);
    });

    it('approves open trial access without api key for hackathon judges', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/chat');
      const result = validateApiKey(req);
      expect(result.authenticated).toBe(true);
    });

    it('approves production bm_live_... keys', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/chat', {
        headers: { 'x-api-key': 'bm_live_secret_token_123' },
      });
      const result = validateApiKey(req);
      expect(result.authenticated).toBe(true);
      expect(result.keyType).toBe('live');
    });

    it('rejects malformed custom tokens with 401 message', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/chat', {
        headers: { 'x-api-key': 'invalid_random_string' },
      });
      const result = validateApiKey(req);
      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('Invalid API key');
    });
  });

  describe('REST Endpoint Handlers', () => {
    it('returns GET discovery metadata for all v1 endpoints', async () => {
      const chatRes = await chatGet();
      const decoderRes = await decoderGet();
      const translatorRes = await translatorGet();
      const supportRes = await supportGet();

      expect(chatRes.status).toBe(200);
      expect(decoderRes.status).toBe(200);
      expect(translatorRes.status).toBe(200);
      expect(supportRes.status).toBe(200);

      const chatJson = await chatRes.json();
      expect(chatJson.endpoint).toBe('/api/v1/chat');
    });

    it('POST /api/v1/chat delivers grounded response with citations', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/chat', {
        method: 'POST',
        headers: { 'x-api-key': 'demo_key_alx_2026', 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: 'በአዋጅ 568/2008 መሠረት ለፈተና ተጨማሪ ጊዜ መጠየቅ እችላለሁ?',
          language: 'am',
        }),
      });

      const res = await chatPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.response).toBeDefined();
      expect(json.data.citations).toBeInstanceOf(Array);
      expect(json.meta.apiVersion).toBe('v1');
    });

    it('POST /api/v1/decoder identifies barriers in job announcement', async () => {
      const sampleJob = `Junior Developer wanted. Must possess valid driving license for field tests. Must submit physical paperwork on 4th floor stairs.`;
      const req = new NextRequest('http://localhost:3000/api/v1/decoder', {
        method: 'POST',
        headers: { 'x-api-key': 'demo_key_alx_2026', 'content-type': 'application/json' },
        body: JSON.stringify({ text: sampleJob }),
      });

      const res = await decoderPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.barriersDetected.length).toBeGreaterThanOrEqual(1);
      expect(json.data.recommendedAccommodations.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/translator generates legal bilingual accommodation letter', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/translator', {
        method: 'POST',
        headers: { 'x-api-key': 'demo_key_alx_2026', 'content-type': 'application/json' },
        body: JSON.stringify({
          candidateName: 'ሙሉጌታ አበበ (Mulugeta Abebe)',
          employerName: 'ALX Hub',
          jobTitle: 'Backend Engineer',
          functionalImpact: 'low_vision',
          specificNeed: '24pt font test papers and high contrast IDE',
          context: 'exam',
          language: 'am',
          tone: 'formal_legal',
        }),
      });

      const res = await translatorPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.subject.am).toContain('568/2008');
      expect(json.data.letterBody.am).toContain('ተገቢውን የማመቻቸት');
      expect(json.data.statutoryReferences).toBeInstanceOf(Array);
    });

    it('POST /api/v1/support enqueues user with structured handoff packet', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/support', {
        method: 'POST',
        headers: { 'x-api-key': 'demo_key_alx_2026', 'content-type': 'application/json' },
        body: JSON.stringify({
          userGoal: 'Encountered inaccessible quiz screen reader issue',
          userLanguage: 'am',
          disclosedAccommodations: ['Screen Reader User'],
          consentTranscript: true,
        }),
      });

      const res = await supportPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.sessionId).toBeDefined();
      expect(json.data.queuePosition).toBeGreaterThanOrEqual(1);
      expect(json.data.handoffPacket).toBeDefined();
    });
  });
});
