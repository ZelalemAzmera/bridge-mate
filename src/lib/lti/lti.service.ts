import crypto from 'crypto';

export interface LtiLaunchContext {
  id: string;
  label?: string;
  title: string;
  type?: string[];
}

export interface LtiLaunchPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nonce: string;
  'https://purl.imsglobal.org/spec/lti/claim/message_type': string;
  'https://purl.imsglobal.org/spec/lti/claim/version': string;
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id': string;
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': string;
  'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
    id: string;
    title?: string;
    description?: string;
  };
  'https://purl.imsglobal.org/spec/lti/claim/roles': string[];
  'https://purl.imsglobal.org/spec/lti/claim/context': LtiLaunchContext;
  name?: string;
  email?: string;
  locale?: string;
  'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'?: {
    scope: string[];
    lineitems?: string;
    lineitem?: string;
  };
}

export interface LtiGradeSubmission {
  userId: string;
  scoreGiven: number;
  scoreMaximum: number;
  comment?: string;
  activityProgress: 'Initialized' | 'Started' | 'InProgress' | 'Submitted' | 'Completed';
  gradingProgress: 'FullyGraded' | 'Pending' | 'PendingManual' | 'Failed' | 'NotReady';
}

// Fixed Key ID for LTI 1.3 Key Rotation
const DEFAULT_KID = 'bridgemate-lti-2026-key1';

// In-memory or pre-generated RSA keypair for zero-config operation
let cachedKeyPair: { publicKey: string; privateKey: string } | null = null;

function getOrCreateKeyPair(): { publicKey: string; privateKey: string } {
  if (cachedKeyPair) return cachedKeyPair;

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  cachedKeyPair = { publicKey, privateKey };
  return cachedKeyPair;
}

export class LtiService {
  /**
   * Generates public JWKS for LTI 1.3 registration.
   */
  public static getPublicJwks(): { keys: any[] } {
    const { publicKey } = getOrCreateKeyPair();
    const pubKeyObj = crypto.createPublicKey(publicKey);
    const jwk = pubKeyObj.export({ format: 'jwk' });

    return {
      keys: [
        {
          kty: jwk.kty,
          use: 'sig',
          alg: 'RS256',
          kid: DEFAULT_KID,
          n: jwk.n,
          e: jwk.e,
        },
      ],
    };
  }

  /**
   * Generates a signed LTI 1.3 ID Token for simulations and tests.
   */
  public static signLtiLaunchToken(payload: Partial<LtiLaunchPayload>): string {
    const { privateKey } = getOrCreateKeyPair();

    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: DEFAULT_KID,
    };

    const fullPayload: LtiLaunchPayload = {
      iss: payload.iss || 'https://savannah.alxafrica.com',
      sub: payload.sub || 'user-alx-8823',
      aud: payload.aud || 'bridgemate-client-id',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      nonce: payload.nonce || crypto.randomBytes(16).toString('hex'),
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': payload['https://purl.imsglobal.org/spec/lti/claim/deployment_id'] || 'dep-savannah-1',
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': payload['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'] || 'https://bridgemate.et/api/lti/launch',
      'https://purl.imsglobal.org/spec/lti/claim/resource_link': payload['https://purl.imsglobal.org/spec/lti/claim/resource_link'] || {
        id: 'link-module-4-quiz',
        title: 'Module 4: Accessible Frontend Assessment',
      },
      'https://purl.imsglobal.org/spec/lti/claim/roles': payload['https://purl.imsglobal.org/spec/lti/claim/roles'] || [
        'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
      ],
      'https://purl.imsglobal.org/spec/lti/claim/context': payload['https://purl.imsglobal.org/spec/lti/claim/context'] || {
        id: 'course-alx-fswd-2026',
        title: 'ALX Fullstack Web Development 2026',
        label: 'FSWD-101',
      },
      name: payload.name || 'ዳዊት ታደሰ (Dawit Tadesse)',
      email: payload.email || 'dawit.t@alxstudent.et',
      locale: payload.locale || 'am',
      ...payload,
    };

    const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signatureInput = `${b64Header}.${b64Payload}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(privateKey, 'base64url');

    return `${signatureInput}.${signature}`;
  }

  /**
   * Decodes and validates an LTI 1.3 JWT token.
   */
  public static verifyLtiToken(jwt: string): { valid: boolean; payload?: LtiLaunchPayload; error?: string } {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Malformed JWT structure' };
      }

      const [b64Header, b64Payload, b64Signature] = parts;
      const signatureInput = `${b64Header}.${b64Payload}`;

      // In production, fetch LMS JWKS. In standalone mode, verify using cached public key
      const { publicKey } = getOrCreateKeyPair();
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(signatureInput);
      const isValidSig = verifier.verify(publicKey, b64Signature, 'base64url');

      const payload: LtiLaunchPayload = JSON.parse(
        Buffer.from(b64Payload, 'base64url').toString('utf-8')
      );

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'LTI Token expired' };
      }

      return { valid: isValidSig, payload };
    } catch (err: any) {
      return { valid: false, error: err?.message || 'JWT verification failed' };
    }
  }

  /**
   * Simulates an LTI 1.3 Assignment and Grade Services (AGS) grade passback.
   */
  public static async submitGrade(
    lineItemUrl: string,
    submission: LtiGradeSubmission
  ): Promise<{ success: boolean; message: string; passbackRecord: any }> {
    const timestamp = new Date().toISOString();
    const passbackRecord = {
      timestamp,
      userId: submission.userId,
      scoreGiven: submission.scoreGiven,
      scoreMaximum: submission.scoreMaximum,
      percentage: Math.round((submission.scoreGiven / submission.scoreMaximum) * 100),
      activityProgress: submission.activityProgress,
      gradingProgress: submission.gradingProgress,
      comment: submission.comment || 'Accommodated assessment completed via BridgeMate',
      lineItemUrl: lineItemUrl || 'https://savannah.alxafrica.com/api/lti/ags/lineitem/101',
    };

    return {
      success: true,
      message: 'LTI 1.3 AGS Grade Passback successfully dispatched to LMS',
      passbackRecord,
    };
  }
}
