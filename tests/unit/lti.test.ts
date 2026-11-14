import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { LtiService } from '@/lib/lti/lti.service';
import { GET as jwksGet } from '@/app/api/lti/jwks/route';
import { POST as loginPost } from '@/app/api/lti/login/route';
import { POST as launchPost } from '@/app/api/lti/launch/route';
import { POST as gradebookPost } from '@/app/api/lti/gradebook/route';

describe('BridgeMate Level 3 LTI 1.3 LMS Interoperability (Door 3)', () => {
  describe('LtiService Core Cryptographic & Standard Operations', () => {
    it('generates compliant public JWKS with RS256 algorithm', () => {
      const jwks = LtiService.getPublicJwks();
      expect(jwks.keys).toBeInstanceOf(Array);
      expect(jwks.keys.length).toBeGreaterThan(0);

      const primaryKey = jwks.keys[0];
      expect(primaryKey.kty).toBe('RSA');
      expect(primaryKey.alg).toBe('RS256');
      expect(primaryKey.use).toBe('sig');
      expect(primaryKey.kid).toBeDefined();
      expect(primaryKey.n).toBeDefined();
      expect(primaryKey.e).toBeDefined();
    });

    it('signs and verifies standard LTI 1.3 JWT Launch tokens', () => {
      const sampleToken = LtiService.signLtiLaunchToken({
        iss: 'https://savannah.alxafrica.com',
        sub: 'user-alx-101',
        name: 'Alemayehu Kebede',
        'https://purl.imsglobal.org/spec/lti/claim/context': {
          id: 'course-alx-2026',
          title: 'ALX Backend Cloud Computing',
        },
      });

      expect(typeof sampleToken).toBe('string');
      expect(sampleToken.split('.').length).toBe(3);

      const verification = LtiService.verifyLtiToken(sampleToken);
      expect(verification.valid).toBe(true);
      expect(verification.payload?.sub).toBe('user-alx-101');
      expect(verification.payload?.name).toBe('Alemayehu Kebede');
      expect(verification.payload?.['https://purl.imsglobal.org/spec/lti/claim/context'].id).toBe('course-alx-2026');
    });

    it('dispatches Assignment & Grade Services (AGS) passback without error', async () => {
      const result = await LtiService.submitGrade(
        'https://savannah.alxafrica.com/api/lti/ags/lineitem/101',
        {
          userId: 'user-alx-101',
          scoreGiven: 98,
          scoreMaximum: 100,
          activityProgress: 'Completed',
          gradingProgress: 'FullyGraded',
          comment: 'Completed with large-font accessibility accommodation',
        }
      );

      expect(result.success).toBe(true);
      expect(result.passbackRecord.percentage).toBe(98);
      expect(result.passbackRecord.activityProgress).toBe('Completed');
    });
  });

  describe('LTI Endpoints Route Handlers', () => {
    it('GET /api/lti/jwks serves valid cache-controlled JWKS response', async () => {
      const res = await jwksGet();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.keys).toBeInstanceOf(Array);
    });

    it('POST /api/lti/login processes OIDC login initiation and generates redirect URL', async () => {
      const req = new NextRequest('http://localhost:3000/api/lti/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          iss: 'https://savannah.alxafrica.com',
          login_hint: 'student-99@alx.et',
          target_link_uri: 'http://localhost:3000/api/lti/launch',
          client_id: 'bridgemate-alx-client',
        }),
      });

      const res = await loginPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.authRedirectUrl).toContain('response_type=id_token');
      expect(json.state).toBeDefined();
      expect(json.nonce).toBeDefined();
    });

    it('POST /api/lti/launch accepts signed JWT token and establishes authenticated course session', async () => {
      const testToken = LtiService.signLtiLaunchToken({
        sub: 'student-alx-456',
        name: 'Tigist Hailu',
        email: 'tigist@alxstudent.et',
        'https://purl.imsglobal.org/spec/lti/claim/context': {
          id: 'alx-swe-cohort-2026',
          title: 'ALX Software Engineering 2026',
        },
      });

      const req = new NextRequest('http://localhost:3000/api/lti/launch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id_token: testToken, state: 'test-state-123' }),
      });

      const res = await launchPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.authenticated).toBe(true);
      expect(json.user.name).toBe('Tigist Hailu');
      expect(json.courseContext.id).toBe('alx-swe-cohort-2026');
      expect(json.sessionToken).toBeDefined();
    });

    it('POST /api/lti/gradebook records assessment score for LMS gradebook', async () => {
      const req = new NextRequest('http://localhost:3000/api/lti/gradebook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: 'student-alx-456',
          scoreGiven: 100,
          scoreMaximum: 100,
          comment: 'Perfect score on accessible test module',
        }),
      });

      const res = await gradebookPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.standard).toContain('LTI Assignment and Grade Services');
    });
  });
});
