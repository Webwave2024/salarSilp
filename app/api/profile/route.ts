import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { findEmployeeByUserId } from '@/repositories/employee.repository';
import { findSalaryByEmployeeId } from '@/repositories/employee.repository';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);

    if (session.role === 'ADMIN') {
      return Response.json({
        userId: session.userId,
        role: 'ADMIN',
        dbUserId: session.dbUserId,
      });
    }

    // Employee: fetch full profile
    const profile = await findEmployeeByUserId(session.dbUserId);
    if (!profile) {
      return Response.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    const salary = await findSalaryByEmployeeId(profile.id);

    return Response.json({
      userId: session.userId,
      role: session.role,
      profile,
      salary,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Profile error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
