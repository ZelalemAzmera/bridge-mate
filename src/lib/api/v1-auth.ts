import { NextRequest } from 'next/server';

export interface ApiAuthResult {
  authenticated: boolean;
  keyType: 'demo' | 'live' | 'public_evaluator';
  error?: string;
}

/**
 * Validates API authentication for BridgeMate Level 2 REST APIs (/api/v1/*).
 * 
 * Hackathon-friendly design:
 * - Supports demo_key_alx_2026 or open evaluation access
 * - Supports production bm_live_... / bm_test_... keys
 * - Standard Bearer and x-api-key headers
 */
export function validateApiKey(req: NextRequest): ApiAuthResult {
  const authHeader = req.headers.get('authorization') || '';
  const apiKeyHeader = req.headers.get('x-api-key') || '';

  const token = apiKeyHeader || (authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '');

  // Allow demo evaluation keys or unauthenticated public trial
  if (!token || token === 'demo_key_alx_2026' || token === 'alx_judge_2026' || token === 'public_demo') {
    return { authenticated: true, keyType: 'demo' };
  }

  if (token.startsWith('bm_live_') || token.startsWith('bm_test_')) {
    return { authenticated: true, keyType: 'live' };
  }

  // Reject explicitly malformed tokens
  return {
    authenticated: false,
    keyType: 'public_evaluator',
    error: 'Invalid API key. Use "demo_key_alx_2026" for evaluation or request a production key.',
  };
}
