import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyToken, COOKIE_NAME, type SessionPayload } from './session';

/**
 * Get the authenticated session from the HTTP-only cookie.
 * Works in both Server Components (no request arg) and API Routes (pass request).
 * Never trust userId from the frontend — always use this.
 */
export async function getSession(request?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (request) {
    // API Route context: read from request cookies
    token = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    // Server Component context: use next/headers
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifyToken(token);
}

/**
 * Require an authenticated session. Returns session or throws a 401 Response.
 */
export async function requireSession(request?: NextRequest): Promise<SessionPayload> {
  const session = await getSession(request);
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}

/**
 * Require an ADMIN session. Returns session or throws a 403 Response.
 */
export async function requireAdmin(request?: NextRequest): Promise<SessionPayload> {
  const session = await requireSession(request);
  if (session.role !== 'ADMIN') {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}
