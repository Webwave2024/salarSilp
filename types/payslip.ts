export interface Payslip {
  id: string;
  employee_id: string;
  pay_period: string;
  pay_period_year: number;
  pay_period_month: number;
  paid_days: number;
  working_days: number;
  loss_of_pay_days: number;
  pending_leave_days: number;
  pay_date: string;
  gross_earnings: number;
  total_deductions: number;
  net_payable: number;
  amount_in_words: string;
  monthly_salary_snapshot: number;
  created_at: Date;
}

export interface PayslipEarning {
  id: string;
  payslip_id: string;
  field_name: string;
  amount: number;
  is_auto: boolean;
  sort_order: number;
}

export interface PayslipDeduction {
  id: string;
  payslip_id: string;
  field_name: string;
  amount: number;
  is_auto: boolean;
  sort_order: number;
}

export interface PayslipSummaryField {
  id: string;
  payslip_id: string;
  field_name: string;
  field_value: string;
  sort_order: number;
}

export interface PayslipFull extends Payslip {
  earnings: PayslipEarning[];
  deductions: PayslipDeduction[];
  summary_fields: PayslipSummaryField[];
  employee_name: string;
  employee_user_id: string;
  designation?: string;
  department?: string;
  joining_date?: string;
}

export interface GeneratePayslipInput {
  employee_id: string;
  pay_period_year: number;
  pay_period_month: number;
  paid_days: number;
  working_days: number;
  loss_of_pay_days: number;
  pay_date: string;
  pending_leave_days: number;
  /** ALL earnings including Basic, HRA, allowances — admin-entered amounts */
  earnings: Array<{ field_name: string; amount: number }>;
  /** ALL deductions including TDS, PF, etc — admin-entered amounts */
  deductions: Array<{ field_name: string; amount: number }>;
  summary_fields: Array<{ field_name: string; field_value: string }>;
}
