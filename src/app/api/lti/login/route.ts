import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * LTI 1.3 OIDC Login Initiation Endpoint
 * Spec: 1EdTech Security Framework v1.0 / LTI Core 1.3
 */
export async function GET(req: NextRequest) {
  return handleOidcLogin(req);
}

export async function POST(req: NextRequest) {
  return handleOidcLogin(req);
}

async function handleOidcLogin(req: NextRequest) {
  try {
    let iss = '';
    let loginHint = '';
    let targetLinkUri = '';
    let ltiMessageHint = '';
    let clientId = '';

    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      iss = searchParams.get('iss') || '';
      loginHint = searchParams.get('login_hint') || '';
      targetLinkUri = searchParams.get('target_link_uri') || '';
      ltiMessageHint = searchParams.get('lti_message_hint') || '';
      clientId = searchParams.get('client_id') || '';
    } else {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.json();
        iss = body.iss || '';
        loginHint = body.login_hint || '';
        targetLinkUri = body.target_link_uri || '';
        ltiMessageHint = body.lti_message_hint || '';
        clientId = body.client_id || '';
      } else {
        const formData = await req.formData();
        iss = (formData.get('iss') as string) || '';
        loginHint = (formData.get('login_hint') as string) || '';
        targetLinkUri = (formData.get('target_link_uri') as string) || '';
        ltiMessageHint = (formData.get('lti_message_hint') as string) || '';
        clientId = (formData.get('client_id') as string) || '';
      }
    }

    if (!iss && !loginHint) {
      // Return metadata for inspection
      return NextResponse.json({
        endpoint: '/api/lti/login',
        status: 'ready',
        supportedLMS: ['Canvas', 'Moodle', 'Blackboard', 'ALX Savannah'],
        spec: '1EdTech LTI 1.3 Core Advantage',
        paramsExpected: ['iss', 'login_hint', 'target_link_uri', 'client_id'],
      });
    }

    const state = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');

    // Default target launch URL
    const launchUrl = targetLinkUri || `${new URL(req.url).origin}/api/lti/launch`;

    // Construct OIDC Auth response URL
    // In actual LMS integration, this redirects to ${iss}/oauth2/auth
    const authEndpoint = iss.includes('http') ? `${iss.replace(/\/$/, '')}/auth` : 'https://savannah.alxafrica.com/oauth2/auth';

    const redirectUrl = new URL(authEndpoint);
    redirectUrl.searchParams.set('response_type', 'id_token');
    redirectUrl.searchParams.set('response_mode', 'form_post');
    redirectUrl.searchParams.set('scope', 'openid');
    redirectUrl.searchParams.set('client_id', clientId || 'bridgemate-lti-client');
    redirectUrl.searchParams.set('redirect_uri', launchUrl);
    redirectUrl.searchParams.set('login_hint', loginHint);
    redirectUrl.searchParams.set('state', state);
    redirectUrl.searchParams.set('nonce', nonce);
    redirectUrl.searchParams.set('prompt', 'none');
    if (ltiMessageHint) {
      redirectUrl.searchParams.set('lti_message_hint', ltiMessageHint);
    }

    return NextResponse.json({
      success: true,
      authRedirectUrl: redirectUrl.toString(),
      state,
      nonce,
      redirectUri: launchUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'LTI OIDC Initiation Failed', details: err?.message },
      { status: 500 }
    );
  }
}
