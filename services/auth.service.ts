import { findUserByUserId } from '@/repositories/user.repository';
import { findEmployeeByUserId } from '@/repositories/employee.repository';
import type { SessionPayload } from '@/lib/session';

export interface LoginResult {
  success: boolean;
  session?: SessionPayload;
  error?: string;
}

/**
 * Authenticate a user by userId + password.
 * Password comparison is plain-text as required.
 * This function is isolated so hashing can be introduced later
 * by only changing the comparison logic here.
 */
export async function login(userId: string, password: string): Promise<LoginResult> {
  const user = await findUserByUserId(userId);
  if (!user) {
    return { success: false, error: 'Invalid User ID or Password' };
  }

  // ── Plain-text comparison (isolated for future hashing) ──────────────────
  const isValid = user.password === password;
  // ────────────────────────────────────────────────────────────────────────

  if (!isValid) {
    return { success: false, error: 'Invalid User ID or Password' };
  }

  let employeeId: string | undefined;
  if (user.role === 'EMPLOYEE') {
    const profile = await findEmployeeByUserId(user.id);
    employeeId = profile?.id;

    // Block inactive or terminated employees from logging in
    const blockedStatuses = ['Inactive', 'Terminated', 'On Leave'];
    if (profile && blockedStatuses.includes(profile.employment_status ?? '')) {
      return { success: false, error: `Your account is ${profile.employment_status}. Please contact HR.` };
    }
  }

  const session: SessionPayload = {
    userId: user.user_id,
    role: user.role as 'ADMIN' | 'EMPLOYEE',
    dbUserId: user.id,
    employeeId,
  };

  return { success: true, session };
}
