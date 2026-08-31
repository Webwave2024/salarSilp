import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getPayslip } from '@/services/payslip.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await params;

    let payslip;
    if (session.role === 'ADMIN') {
      // Admin can view any payslip
      payslip = await getPayslip(id);
    } else {
      // Employee can only view their own
      if (!session.employeeId) {
        return Response.json({ error: 'Employee profile not found' }, { status: 404 });
      }
      payslip = await getPayslip(id, session.employeeId);
    }

    if (!payslip) {
      return Response.json({ error: 'Payslip not found or access denied' }, { status: 404 });
    }

    return Response.json({ payslip });
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
