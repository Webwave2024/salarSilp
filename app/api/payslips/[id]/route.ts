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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    if (session.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    
    // Import dynamically or ensure we import it at the top. Wait, I should add the import at the top of the file!
    // I will do that in a separate multi_replace or use require here to avoid import issues.
    const { deletePayslip } = await import('@/repositories/payslip.repository');
    const success = await deletePayslip(id);
    if (!success) return Response.json({ error: 'Payslip not found' }, { status: 404 });
    
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { z } from 'zod';

const lineItemSchema = z.object({
  field_name: z.string().min(1, 'Field name is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
});

const GeneratePayslipSchema = z.object({
  employee_id:       z.string().uuid('Invalid employee ID'),
  pay_period_year:   z.number().int().min(2000).max(2100),
  pay_period_month:  z.number().int().min(1).max(12),
  paid_days:         z.number().min(0),
  working_days:      z.number().min(1).max(31),
  loss_of_pay_days:  z.number().min(0),
  pending_leave_days: z.number().min(0).max(31),
  pay_date:          z.string().min(1, 'Pay date is required'),
  earnings:          z.array(lineItemSchema).min(1, 'At least one earning is required'),
  deductions:        z.array(lineItemSchema).default([]),
  summary_fields:    z.array(z.object({
    field_name:  z.string().min(1),
    field_value: z.string(),
  })).default([]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    if (session.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    
    const parsed = GeneratePayslipSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const { editPayslip } = await import('@/services/payslip.service');
    const payslip = await editPayslip(id, parsed.data);
    
    return Response.json({ payslip });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
