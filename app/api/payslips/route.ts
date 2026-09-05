import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { generatePayslip, getEmployeePayslips, getAllPayslips } from '@/services/payslip.service';
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
  pending_leave_days: z.number().min(0).max(31),
  loss_of_pay_days:  z.number().min(0),
  pay_date:          z.string().min(1, 'Pay date is required'),
  earnings:          z.array(lineItemSchema).min(1, 'At least one earning is required'),
  deductions:        z.array(lineItemSchema).default([]),
  summary_fields:    z.array(z.object({
    field_name:  z.string().min(1),
    field_value: z.string(),
  })).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);

    if (session.role === 'ADMIN') {
      const payslips = await getAllPayslips();
      return Response.json({ payslips });
    }

    if (!session.employeeId) {
      return Response.json({ error: 'Employee profile not found' }, { status: 404 });
    }
    const payslips = await getEmployeePayslips(session.employeeId);
    return Response.json({ payslips });
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();

    const parsed = GeneratePayslipSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.paid_days > parsed.data.working_days) {
      return Response.json({ error: 'Paid days cannot exceed working days' }, { status: 400 });
    }

    if (session.role === 'EMPLOYEE') {
      if (!session.employeeId || parsed.data.employee_id !== session.employeeId) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const payslip = await generatePayslip(parsed.data);
    return Response.json({ success: true, payslip }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
