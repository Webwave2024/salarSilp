import pool from '@/lib/db';
import type { Payslip, PayslipFull, PayslipEarning, PayslipDeduction, PayslipSummaryField } from '@/types/payslip';

export async function createPayslip(data: {
  employee_id: string;
  pay_period: string;
  pay_period_year: number;
  pay_period_month: number;
  paid_days: number;
  working_days: number;
  loss_of_pay_days: number;
  pay_date: string;
  gross_earnings: number;
  total_deductions: number;
  net_payable: number;
  amount_in_words: string;
  monthly_salary_snapshot: number;
  earnings: Array<{ field_name: string; amount: number; is_auto: boolean; sort_order: number }>;
  deductions: Array<{ field_name: string; amount: number; is_auto: boolean; sort_order: number }>;
  summary_fields: Array<{ field_name: string; field_value: string; sort_order: number }>;
}): Promise<Payslip> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert payslip
    const payslipResult = await client.query<Payslip>(
      `INSERT INTO payslips (
         employee_id, pay_period, pay_period_year, pay_period_month,
         paid_days, working_days, loss_of_pay_days, pay_date,
         gross_earnings, total_deductions, net_payable,
         amount_in_words, monthly_salary_snapshot
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        data.employee_id, data.pay_period, data.pay_period_year, data.pay_period_month,
        data.paid_days, data.working_days, data.loss_of_pay_days, data.pay_date,
        data.gross_earnings, data.total_deductions, data.net_payable,
        data.amount_in_words, data.monthly_salary_snapshot,
      ]
    );
    const payslip = payslipResult.rows[0];

    // Insert earnings
    for (const e of data.earnings) {
      await client.query(
        `INSERT INTO payslip_earnings (payslip_id, field_name, amount, is_auto, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [payslip.id, e.field_name, e.amount, e.is_auto, e.sort_order]
      );
    }

    // Insert deductions
    for (const d of data.deductions) {
      await client.query(
        `INSERT INTO payslip_deductions (payslip_id, field_name, amount, is_auto, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [payslip.id, d.field_name, d.amount, d.is_auto, d.sort_order]
      );
    }

    // Insert summary fields
    for (const f of data.summary_fields) {
      await client.query(
        `INSERT INTO payslip_summary_fields (payslip_id, field_name, field_value, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [payslip.id, f.field_name, f.field_value, f.sort_order]
      );
    }

    await client.query('COMMIT');
    return payslip;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findPayslipById(id: string): Promise<PayslipFull | null> {
  const payslipResult = await pool.query<Payslip & { employee_name: string; employee_user_id: string; designation: string; department: string; joining_date: string }>(
    `SELECT p.*,
            ep.full_name AS employee_name,
            u.user_id AS employee_user_id,
            ep.designation,
            ep.department,
            ep.joining_date
     FROM payslips p
     JOIN employee_profiles ep ON p.employee_id = ep.id
     JOIN users u ON ep.user_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  const payslip = payslipResult.rows[0];
  if (!payslip) return null;

  const [earningsRes, deductionsRes, summaryRes] = await Promise.all([
    pool.query<PayslipEarning>('SELECT * FROM payslip_earnings WHERE payslip_id = $1 ORDER BY sort_order', [id]),
    pool.query<PayslipDeduction>('SELECT * FROM payslip_deductions WHERE payslip_id = $1 ORDER BY sort_order', [id]),
    pool.query<PayslipSummaryField>('SELECT * FROM payslip_summary_fields WHERE payslip_id = $1 ORDER BY sort_order', [id]),
  ]);

  return {
    ...payslip,
    earnings: earningsRes.rows,
    deductions: deductionsRes.rows,
    summary_fields: summaryRes.rows,
  } as PayslipFull;
}

export async function findPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
  const result = await pool.query<Payslip>(
    `SELECT * FROM payslips WHERE employee_id = $1 ORDER BY pay_period_year DESC, pay_period_month DESC`,
    [employeeId]
  );
  return result.rows;
}

export async function findAllPayslips(): Promise<Array<Payslip & { employee_name: string; employee_user_id: string }>> {
  const result = await pool.query<Payslip & { employee_name: string; employee_user_id: string }>(
    `SELECT p.*,
            ep.full_name AS employee_name,
            u.user_id AS employee_user_id
     FROM payslips p
     JOIN employee_profiles ep ON p.employee_id = ep.id
     JOIN users u ON ep.user_id = u.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
}

export async function payslipBelongsToEmployee(payslipId: string, employeeId: string): Promise<boolean> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM payslips WHERE id = $1 AND employee_id = $2',
    [payslipId, employeeId]
  );
  return parseInt(result.rows[0].count) > 0;
}

export async function deletePayslip(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM payslip_earnings WHERE payslip_id = $1', [id]);
    await client.query('DELETE FROM payslip_deductions WHERE payslip_id = $1', [id]);
    await client.query('DELETE FROM payslip_summary_fields WHERE payslip_id = $1', [id]);
    const result = await client.query('DELETE FROM payslips WHERE id = $1', [id]);
    await client.query('COMMIT');
    return result.rowCount !== null && result.rowCount > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updatePayslip(id: string, data: {
  pay_period: string;
  pay_period_year: number;
  pay_period_month: number;
  paid_days: number;
  working_days: number;
  loss_of_pay_days: number;
  pay_date: string;
  gross_earnings: number;
  total_deductions: number;
  net_payable: number;
  amount_in_words: string;
  earnings: Array<{ field_name: string; amount: number; is_auto: boolean; sort_order: number }>;
  deductions: Array<{ field_name: string; amount: number; is_auto: boolean; sort_order: number }>;
  summary_fields: Array<{ field_name: string; field_value: string; sort_order: number }>;
}): Promise<Payslip> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const payslipResult = await client.query<Payslip>(
      `UPDATE payslips 
       SET pay_period = $2, pay_period_year = $3, pay_period_month = $4,
           paid_days = $5, working_days = $6, loss_of_pay_days = $7, pay_date = $8,
           gross_earnings = $9, total_deductions = $10, net_payable = $11,
           amount_in_words = $12
       WHERE id = $1
       RETURNING *`,
      [
        id, data.pay_period, data.pay_period_year, data.pay_period_month,
        data.paid_days, data.working_days, data.loss_of_pay_days, data.pay_date,
        data.gross_earnings, data.total_deductions, data.net_payable,
        data.amount_in_words
      ]
    );
    const payslip = payslipResult.rows[0];
    if (!payslip) throw new Error('Payslip not found');

    await client.query('DELETE FROM payslip_earnings WHERE payslip_id = $1', [id]);
    await client.query('DELETE FROM payslip_deductions WHERE payslip_id = $1', [id]);
    await client.query('DELETE FROM payslip_summary_fields WHERE payslip_id = $1', [id]);

    for (const e of data.earnings) {
      await client.query(
        `INSERT INTO payslip_earnings (payslip_id, field_name, amount, is_auto, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, e.field_name, e.amount, e.is_auto, e.sort_order]
      );
    }
    for (const d of data.deductions) {
      await client.query(
        `INSERT INTO payslip_deductions (payslip_id, field_name, amount, is_auto, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, d.field_name, d.amount, d.is_auto, d.sort_order]
      );
    }
    for (const f of data.summary_fields) {
      await client.query(
        `INSERT INTO payslip_summary_fields (payslip_id, field_name, field_value, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [id, f.field_name, f.field_value, f.sort_order]
      );
    }

    await client.query('COMMIT');
    return payslip;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
