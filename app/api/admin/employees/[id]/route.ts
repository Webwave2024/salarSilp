import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { findEmployeeById, updateEmployeeProfile, deleteEmployee, createOrUpdateSalary, findSalaryByEmployeeId } from '@/repositories/employee.repository';
import { z } from 'zod';

const UpdateEmployeeSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.email().optional(),
  dob: z.string().optional(),
  contact_number: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  joining_date: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  qualification: z.string().optional(),
  employment_type: z.string().optional(),
  employment_status: z.string().optional(),
  pan_number: z.string().optional(),
  aadhaar_number: z.string().optional(),
  bank_account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  annual_salary: z.number().min(0).optional(),
  monthly_salary: z.number().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const employee = await findEmployeeById(id);
    if (!employee) return Response.json({ error: 'Employee not found' }, { status: 404 });
    const salary = await findSalaryByEmployeeId(id);
    return Response.json({ employee, salary });
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();

    const parsed = UpdateEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await updateEmployeeProfile(id, parsed.data);
    if (!updated) return Response.json({ error: 'Employee not found' }, { status: 404 });

    if (parsed.data.annual_salary !== undefined || parsed.data.monthly_salary !== undefined) {
      const existing = await findSalaryByEmployeeId(id);
      await createOrUpdateSalary(id, {
        annual_salary: parsed.data.annual_salary ?? existing?.annual_salary ?? 0,
        monthly_salary: parsed.data.monthly_salary ?? existing?.monthly_salary ?? 0,
      });
    }

    return Response.json({ success: true, employee: updated });
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
    await requireAdmin(request);
    const { id } = await params;
    await deleteEmployee(id);
    return Response.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
