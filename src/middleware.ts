import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { env } from '@/lib/env';

// Protected path prefixes
const protectedRoutes = [
  '/learn',
  '/decoder',
  '/translator',
  '/support',
  '/discover',
  '/api/chat',
  '/api/decoder',
  '/api/translator',
  '/api/support/request',
  '/api/support/consent',
];

function isProtectedPath(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

// In mock mode, handle session bypass and header injection
function handleMockAuth(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const isProtected = isProtectedPath(pathname);

  // Check if simulated unauthenticated mode is requested via cookie or header
  const mockUnauthCookie = req.cookies.get('bridgemate_mock_unauthenticated')?.value;
  const mockUnauthHeader = req.headers.get('x-bridgemate-mock-unauthenticated');
  const isSimulatedUnauthenticated = mockUnauthCookie === 'true' || mockUnauthHeader === 'true';

  if (isProtected && isSimulatedUnauthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Inject mock user headers downstream to Server Components & Route Handlers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-bridgemate-mock-auth', 'true');
  requestHeaders.set('x-bridgemate-user-id', 'user_mock_selamawit_01');
  requestHeaders.set('x-bridgemate-user-name', 'Selamawit Tadesse');
  requestHeaders.set('x-bridgemate-user-email', 'selamawit@example.com');
  requestHeaders.set('x-bridgemate-user-lang', 'am');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Lazy Clerk middleware instantiation
let clerkHandler: ((req: NextRequest, event: NextFetchEvent) => Promise<NextResponse>) | null = null;

async function getClerkHandler() {
  if (!clerkHandler) {
    const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
    const isProtectedRoute = createRouteMatcher(
      protectedRoutes.map((route) => `${route}(.*)`)
    );
    clerkHandler = clerkMiddleware(async (auth: any, req: any) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    }) as unknown as (req: NextRequest, event: NextFetchEvent) => Promise<NextResponse>;
  }
  return clerkHandler;
}

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (env.isMockAuth) {
    return handleMockAuth(req);
  }

  try {
    const handler = await getClerkHandler();
    return await handler(req, event);
  } catch (err) {
    console.warn('[Middleware] Clerk execution failed, falling back to mock auth:', err);
    return handleMockAuth(req);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
