import { COOKIE_NAME } from '@/lib/session';

export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
  return response;
}
