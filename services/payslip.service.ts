import { findSalaryByEmployeeId } from '@/repositories/employee.repository';
import { createPayslip, findPayslipById, findPayslipsByEmployee, findAllPayslips, payslipBelongsToEmployee } from '@/repositories/payslip.repository';
import { calculatePayslip, safeNum } from './salaryCalculation.service';
import { amountToWords } from '@/utils/amountToWords';
import { payPeriodLabel } from '@/utils/salaryUtils';
import type { GeneratePayslipInput, Payslip, PayslipFull } from '@/types/payslip';

export async function generatePayslip(input: GeneratePayslipInput): Promise<PayslipFull> {
  // 1. Sanitise all amounts — prevent NaN / Infinity
  const earnings = input.earnings.map((e, i) => ({
    field_name: e.field_name.trim(),
    amount: safeNum(e.amount),
    is_auto: false,
    sort_order: i,
  }));

  const deductions = input.deductions.map((d, i) => ({
    field_name: d.field_name.trim(),
    amount: safeNum(d.amount),
    is_auto: false,
    sort_order: i,
  }));

  const summary_fields = input.summary_fields.map((f, i) => ({
    field_name: f.field_name.trim(),
    field_value: f.field_value,
    sort_order: i,
  }));

  // 2. Run centralised calculation — backend is source of truth
  //
  //    grossEarnings  = SUM(all earning amounts)
  //    lopAmount      = (gross / working_days) × lop_days
  //    paidGross      = gross - lop
  //    totalDeductions= SUM(all deduction amounts)
  //    netSalary      = paidGross - totalDeductions
  //
  //    Example: [Basic ₹12500, HRA ₹6250, Special ₹6250] → gross = ₹25000
  //             [TDS ₹0, PF ₹1500]                       → deductions = ₹1500
  //             LOP = 0                                   → net = ₹23500
  const calc = calculatePayslip({
    earnings,
    deductions,
    working_days: input.working_days,
    loss_of_pay_days: input.loss_of_pay_days,
  });

  // 3. Look up salary snapshot (optional — for record keeping; does not affect calculation)
  const salaryRecord = await findSalaryByEmployeeId(input.employee_id).catch(() => null);
  const monthly_salary_snapshot = salaryRecord?.monthly_salary ?? 0;

  const pay_period = payPeriodLabel(input.pay_period_year, input.pay_period_month);

  // 4. Persist in a transaction
  const payslip = await createPayslip({
    employee_id: input.employee_id,
    pay_period,
    pay_period_year: input.pay_period_year,
    pay_period_month: input.pay_period_month,
    paid_days: input.paid_days,
    working_days: input.working_days,
    loss_of_pay_days: input.loss_of_pay_days,
    pending_leave_days: input.pending_leave_days,
    pay_date: input.pay_date,
    gross_earnings: calc.grossEarnings,
    total_deductions: calc.totalDeductions,
    net_payable: calc.netSalary,
    amount_in_words: amountToWords(calc.netSalary),
    monthly_salary_snapshot,
    earnings,
    deductions,
    summary_fields,
  });

  // 5. Return full payslip
  const full = await findPayslipById(payslip.id);
  if (!full) throw new Error('Payslip created but could not be retrieved.');
  return full;
}

export async function editPayslip(id: string, input: GeneratePayslipInput): Promise<PayslipFull> {
  const { updatePayslip } = await import('@/repositories/payslip.repository');

  const earnings = input.earnings.map((e, i) => ({
    field_name: e.field_name.trim(),
    amount: safeNum(e.amount),
    is_auto: false,
    sort_order: i,
  }));

  const deductions = input.deductions.map((d, i) => ({
    field_name: d.field_name.trim(),
    amount: safeNum(d.amount),
    is_auto: false,
    sort_order: i,
  }));

  const summary_fields = input.summary_fields.map((f, i) => ({
    field_name: f.field_name.trim(),
    field_value: f.field_value,
    sort_order: i,
  }));

  const calc = calculatePayslip({
    earnings,
    deductions,
    working_days: input.working_days,
    loss_of_pay_days: input.loss_of_pay_days,
  });

  const pay_period = payPeriodLabel(input.pay_period_year, input.pay_period_month);

  await updatePayslip(id, {
    pay_period,
    pay_period_year: input.pay_period_year,
    pay_period_month: input.pay_period_month,
    paid_days: input.paid_days,
    working_days: input.working_days,
    loss_of_pay_days: input.loss_of_pay_days,
    pay_date: input.pay_date,
    pending_leave_days: input.pending_leave_days,
    gross_earnings: calc.grossEarnings,
    total_deductions: calc.totalDeductions,
    net_payable: calc.netSalary,
    amount_in_words: amountToWords(calc.netSalary),
    earnings,
    deductions,
    summary_fields,
  });

  const full = await findPayslipById(id);
  if (!full) throw new Error('Payslip updated but could not be retrieved.');
  return full;
}

export async function getPayslip(id: string, employeeId?: string): Promise<PayslipFull | null> {
  if (employeeId) {
    const belongs = await payslipBelongsToEmployee(id, employeeId);
    if (!belongs) return null;
  }
  return findPayslipById(id);
}

export async function getEmployeePayslips(employeeId: string): Promise<Payslip[]> {
  return findPayslipsByEmployee(employeeId);
}

export async function getAllPayslips() {
  return findAllPayslips();
}
