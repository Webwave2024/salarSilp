import { NextRequest } from 'next/server';
import { login } from '@/services/auth.service';
import { signToken, COOKIE_NAME, MAX_AGE } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return Response.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    const result = await login(userId.trim(), password);

    if (!result.success || !result.session) {
      return Response.json(
        { error: result.error || 'Invalid User ID or Password' },
        { status: 401 }
      );
    }

    const token = await signToken(result.session);

    const response = Response.json({
      success: true,
      role: result.session.role,
      userId: result.session.userId,
    });

    // Set HTTP-only session cookie — never trust userId from frontend after this
    response.headers.set(
      'Set-Cookie',
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
