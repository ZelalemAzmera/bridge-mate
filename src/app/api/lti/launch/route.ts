import { NextRequest, NextResponse } from 'next/server';
import { LtiService } from '@/lib/lti/lti.service';

export const runtime = 'nodejs';

/**
 * LTI 1.3 Resource Link Launch Endpoint
 * Receives the signed id_token from Canvas/Moodle/ALX Savannah.
 */
export async function POST(req: NextRequest) {
  try {
    let idToken = '';
    let state = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      idToken = body.id_token || '';
      state = body.state || '';
    } else {
      const formData = await req.formData();
      idToken = (formData.get('id_token') as string) || '';
      state = (formData.get('state') as string) || '';
    }

    // Fallback if testing without token: generate signed demo token
    if (!idToken) {
      idToken = LtiService.signLtiLaunchToken({});
    }

    const verification = LtiService.verifyLtiToken(idToken);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired LTI 1.3 ID Token',
          details: verification.error,
        },
        { status: 401 }
      );
    }

    const payload = verification.payload;
    const course = payload['https://purl.imsglobal.org/spec/lti/claim/context'];
    const resourceLink = payload['https://purl.imsglobal.org/spec/lti/claim/resource_link'];
    const roles = payload['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];
    const isLearner = roles.some((r) => r.includes('Learner') || r.includes('Student'));
    const isInstructor = roles.some((r) => r.includes('Instructor') || r.includes('Teacher'));

    // Check if client expects HTML or JSON
    const acceptHeader = req.headers.get('accept') || '';
    const wantsHtml = acceptHeader.includes('text/html');

    if (wantsHtml) {
      // Direct redirect to Learn with query parameters
      const destination = new URL('/learn', req.url);
      destination.searchParams.set('lti_session', 'active');
      destination.searchParams.set('course_id', course?.id || 'alx-course');
      destination.searchParams.set('course_title', course?.title || 'ALX Course');
      destination.searchParams.set('user_name', payload.name || 'Student');
      return NextResponse.redirect(destination);
    }

    return NextResponse.json({
      success: true,
      ltiVersion: '1.3.0',
      authenticated: true,
      user: {
        id: payload.sub,
        name: payload.name || 'ALX Learner',
        email: payload.email || 'student@alxafrica.com',
        locale: payload.locale || 'am',
        roles: {
          isLearner,
          isInstructor,
          raw: roles,
        },
      },
      courseContext: {
        id: course?.id || 'alx-course-default',
        title: course?.title || 'ALX Software Engineering',
        label: course?.label || 'SWE-2026',
      },
      resourceLink: {
        id: resourceLink?.id,
        title: resourceLink?.title,
      },
      agsEndpoint: payload['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'] || null,
      sessionToken: `lti_sess_${Buffer.from(payload.sub).toString('base64url').slice(0, 16)}`,
    });
  } catch (err: any) {
    console.error('[LTI Launch Error]:', err);
    return NextResponse.json(
      { success: false, error: 'LTI Launch processing failed', details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Generate sample token for interactive simulation
  const token = LtiService.signLtiLaunchToken({});
  return NextResponse.json({
    endpoint: '/api/lti/launch',
    description: 'BridgeMate LTI 1.3 Launch Endpoint. Send POST with id_token.',
    testToken: token,
  });
}
