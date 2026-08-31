import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createEmployee, listEmployees, listActiveEmployees } from '@/services/employee.service';
import { z } from 'zod';

const CreateEmployeeSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.email('Invalid email address'),
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
  annual_salary: z.number().min(0, 'Salary cannot be negative'),
  monthly_salary: z.number().min(0, 'Salary cannot be negative'),
  pan_number: z.string().optional(),
  aadhaar_number: z.string().optional(),
  bank_account_number: z.string().optional(),
  ifsc_code: z.string().optional(),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const activeOnly = request.nextUrl.searchParams.get('active') === 'true';
    const employees = activeOnly ? await listActiveEmployees() : await listEmployees();
    return Response.json({ employees });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('List employees error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();

    const parsed = CreateEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createEmployee(parsed.data);

    return Response.json({
      success: true,
      user: {
        userId: result.userId,
        name: result.full_name,
        employeeId: result.employeeId,
      },
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Create employee error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
