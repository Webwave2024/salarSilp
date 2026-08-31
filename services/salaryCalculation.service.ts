/**
 * salaryCalculation.service.ts
 * ─────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all salary calculations.
 * The backend must always call calculatePayslip() before saving a payslip.
 */
import { round2 } from '@/utils/salaryUtils';
import { getTaxSlabs } from './tax.service';

// ── Types ──────────────────────────────────────────────────────

export interface SalaryConfig {
  monthly_salary: number;
  basic_percentage: number;
  hra_percentage: number;
  pf_percentage: number;
}

export interface AttendanceConfig {
  working_days: number;
  paid_days: number;
  loss_of_pay_days: number;
}

export interface CalculatedSalary {
  effective_monthly: number;
  basic: number;
  hra: number;
  gross_earnings: number;
  tds_monthly: number;
  pf: number;
  total_deductions: number;
  net_payable: number;
}

export interface PayslipLineItem {
  field_name: string;
  amount: number;
}

export interface PayslipCalcInput {
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  working_days: number;
  loss_of_pay_days: number;
}

export interface PayslipCalcResult {
  grossEarnings: number;   // SUM of ALL earning rows
  lopAmount: number;       // (grossEarnings / working_days) × loss_of_pay_days
  paidGross: number;       // grossEarnings - lopAmount
  totalDeductions: number; // SUM of ALL deduction rows
  netSalary: number;       // paidGross - totalDeductions
}

// ── Helpers ────────────────────────────────────────────────────

/** Safely convert any value to a finite non-negative number. Prevents NaN/Infinity. */
export function safeNum(val: unknown): number {
  const n = parseFloat(String(val ?? 0));
  if (!isFinite(n) || isNaN(n)) return 0;
  return Math.max(0, n);
}

// ── PRIMARY: Dynamic Payslip Calculator ───────────────────────

/**
 * calculatePayslip — the ONLY function that should compute final payslip totals.
 *
 * Rules:
 *  - Gross Earnings  = SUM of ALL earning amounts (no hardcoded field names)
 *  - LOP Amount      = (Gross / working_days) × loss_of_pay_days  (0 if lop=0)
 *  - Paid Gross      = Gross - LOP
 *  - Total Deductions= SUM of ALL deduction amounts
 *  - Net Salary      = Paid Gross - Total Deductions
 *
 * Example:
 *   earnings = [Basic ₹12500, HRA ₹6250, Special ₹6250]  → Gross = ₹25000
 *   deductions = [TDS ₹0, PF ₹1500]                      → Total Deductions = ₹1500
 *   LOP days = 0                                          → LOP = ₹0
 *   Net = ₹25000 - ₹0 - ₹1500 = ₹23500
 */
export function calculatePayslip(input: PayslipCalcInput): PayslipCalcResult {
  const { earnings, deductions, working_days, loss_of_pay_days } = input;

  // 1. Gross = sum of ALL earning rows
  const grossEarnings = round2(
    earnings.reduce((sum, e) => sum + safeNum(e.amount), 0)
  );

  // 2. LOP deduction (proportional to gross)
  const lopAmount =
    loss_of_pay_days > 0 && working_days > 0
      ? round2((grossEarnings / safeNum(working_days)) * safeNum(loss_of_pay_days))
      : 0;

  const paidGross = round2(grossEarnings - lopAmount);

  // 3. Total deductions = sum of ALL deduction rows
  const totalDeductions = round2(
    deductions.reduce((sum, d) => sum + safeNum(d.amount), 0)
  );

  // 4. Net
  const netSalary = round2(paidGross - totalDeductions);

  return { grossEarnings, lopAmount, paidGross, totalDeductions, netSalary };
}

// ── LEGACY: Percentage-based preview calculation ───────────────
// Used ONLY by /api/admin/employees/[id]/salary-preview to pre-fill form defaults.
// NOT used for final payslip generation.

export function calculateEffectiveMonthly(
  monthly_salary: number,
  working_days: number,
  loss_of_pay_days: number
): number {
  if (loss_of_pay_days <= 0) return monthly_salary;
  const daily_rate = monthly_salary / working_days;
  return round2(monthly_salary - round2(daily_rate * loss_of_pay_days));
}

export async function calculateSalary(
  config: SalaryConfig,
  attendance: AttendanceConfig,
  extra_earnings: number = 0,
  extra_deductions: number = 0
): Promise<CalculatedSalary> {
  const effective_monthly = calculateEffectiveMonthly(
    config.monthly_salary,
    attendance.working_days,
    attendance.loss_of_pay_days
  );

  const basic = round2(effective_monthly * (config.basic_percentage / 100));
  const hra   = round2(basic * (config.hra_percentage / 100));
  const pf    = round2(basic * (config.pf_percentage / 100));
  const gross_earnings = round2(basic + hra + extra_earnings);

  const annualised = round2(effective_monthly * 12);
  const annual_tds = await calculateAnnualTDS(annualised);
  const tds_monthly = round2(annual_tds / 12);

  const total_deductions = round2(tds_monthly + pf + extra_deductions);
  const net_payable = round2(gross_earnings - total_deductions);

  return { effective_monthly, basic, hra, gross_earnings, tds_monthly, pf, total_deductions, net_payable };
}

export async function calculateAnnualTDS(annual_income: number): Promise<number> {
  const slabs = await getTaxSlabs();
  let tax = 0;
  for (const slab of slabs) {
    if (annual_income <= slab.min_income) continue;
    const upper = slab.max_income ?? Infinity;
    const taxable_in_slab = Math.min(annual_income, upper) - slab.min_income;
    if (taxable_in_slab > 0) tax += taxable_in_slab * (slab.tax_rate / 100);
  }
  return round2(tax);
}
