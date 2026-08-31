import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'webwave-payslip-secret-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'ww_session';
const MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

export interface SessionPayload {
  userId: string;       // WEBWAVE-XXXXX
  role: 'ADMIN' | 'EMPLOYEE';
  dbUserId: string;     // UUID from users table
  employeeId?: string;  // UUID from employee_profiles table (null for ADMIN)
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, MAX_AGE };
