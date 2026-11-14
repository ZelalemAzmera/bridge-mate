import { NextResponse } from 'next/server';
import { LtiService } from '@/lib/lti/lti.service';

export const runtime = 'nodejs';

export async function GET() {
  const jwks = LtiService.getPublicJwks();
  return NextResponse.json(jwks, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
    },
  });
}
