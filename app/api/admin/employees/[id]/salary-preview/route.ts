import { NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { findSalaryByEmployeeId } from '@/repositories/employee.repository';
import { calculateSalary } from '@/services/salaryCalculation.service';
import { round2 } from '@/utils/salaryUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession(request);
    const { id } = await params;

    const salary = await findSalaryByEmployeeId(id);
    if (!salary) {
      return Response.json({ error: 'No salary record found' }, { status: 404 });
    }

    // Preview calculation with default 26/26 working days, no LOP
    const workingDays = 26;
    const calc = await calculateSalary(
      {
        monthly_salary: salary.monthly_salary,
        basic_percentage: salary.basic_percentage,
        hra_percentage: salary.hra_percentage,
        pf_percentage: salary.pf_percentage,
      },
      { working_days: workingDays, paid_days: workingDays, loss_of_pay_days: 0 },
      0,
      0
    );

    return Response.json({
      monthly_salary: salary.monthly_salary,
      basic_percentage: salary.basic_percentage,
      hra_percentage: salary.hra_percentage,
      pf_percentage: salary.pf_percentage,
      preview: {
        basic: calc.basic,
        hra: calc.hra,
        tds: calc.tds_monthly,
        pf: calc.pf,
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
