import pool from '@/lib/db';
import type { EmployeeProfile, EmployeeWithUser, EmployeeSalary, CreateEmployeeInput } from '@/types/employee';

// ── Employee Profile ────────────────────────────────────────────────────────

export async function findEmployeeByUserId(dbUserId: string): Promise<EmployeeProfile | null> {
  const result = await pool.query<EmployeeProfile>(
    'SELECT * FROM employee_profiles WHERE user_id = $1 LIMIT 1',
    [dbUserId]
  );
  return result.rows[0] ?? null;
}

export async function findEmployeeById(employeeId: string): Promise<EmployeeWithUser | null> {
  const result = await pool.query<EmployeeWithUser>(
    `SELECT ep.*, u.user_id AS webwave_user_id, u.role
     FROM employee_profiles ep
     JOIN users u ON ep.user_id = u.id
     WHERE ep.id = $1 LIMIT 1`,
    [employeeId]
  );
  return result.rows[0] ?? null;
}

export async function findAllEmployees(): Promise<EmployeeWithUser[]> {
  const result = await pool.query<EmployeeWithUser>(
    `SELECT ep.*, u.user_id AS webwave_user_id, u.role
     FROM employee_profiles ep
     JOIN users u ON ep.user_id = u.id
     WHERE u.role != 'ADMIN'
     ORDER BY ep.created_at DESC`
  );
  return result.rows;
}

export async function findActiveEmployees(): Promise<EmployeeWithUser[]> {
  const result = await pool.query<EmployeeWithUser>(
    `SELECT ep.*, u.user_id AS webwave_user_id, u.role
     FROM employee_profiles ep
     JOIN users u ON ep.user_id = u.id
     WHERE ep.employment_status = 'Active' AND u.role != 'ADMIN'
     ORDER BY ep.full_name ASC`
  );
  return result.rows;
}

export async function createEmployeeProfile(
  dbUserId: string,
  data: CreateEmployeeInput
): Promise<EmployeeProfile> {
  const result = await pool.query<EmployeeProfile>(
    `INSERT INTO employee_profiles (
       user_id, full_name, email, dob, contact_number, gender, address,
       joining_date, designation, department, qualification,
       employment_type, employment_status,
       pan_number, aadhaar_number, bank_account_number, ifsc_code
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11,
       $12, $13,
       $14, $15, $16, $17
     ) RETURNING *`,
    [
      dbUserId,
      data.full_name,
      data.email,
      data.dob || null,
      data.contact_number || null,
      data.gender || null,
      data.address || null,
      data.joining_date || null,
      data.designation || null,
      data.department || null,
      data.qualification || null,
      data.employment_type || null,
      data.employment_status || 'Active',
      data.pan_number || null,
      data.aadhaar_number || null,
      data.bank_account_number || null,
      data.ifsc_code || null,
    ]
  );
  return result.rows[0];
}

export async function updateEmployeeProfile(
  employeeId: string,
  data: Partial<CreateEmployeeInput>
): Promise<EmployeeProfile | null> {
  const result = await pool.query<EmployeeProfile>(
    `UPDATE employee_profiles SET
       full_name = COALESCE($2, full_name),
       email = COALESCE($3, email),
       dob = COALESCE($4, dob),
       contact_number = COALESCE($5, contact_number),
       gender = COALESCE($6, gender),
       address = COALESCE($7, address),
       joining_date = COALESCE($8, joining_date),
       designation = COALESCE($9, designation),
       department = COALESCE($10, department),
       qualification = COALESCE($11, qualification),
       employment_type = COALESCE($12, employment_type),
       employment_status = COALESCE($13, employment_status),
       pan_number = COALESCE($14, pan_number),
       aadhaar_number = COALESCE($15, aadhaar_number),
       bank_account_number = COALESCE($16, bank_account_number),
       ifsc_code = COALESCE($17, ifsc_code),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      employeeId,
      data.full_name,
      data.email,
      data.dob,
      data.contact_number,
      data.gender,
      data.address,
      data.joining_date,
      data.designation,
      data.department,
      data.qualification,
      data.employment_type,
      data.employment_status,
      data.pan_number,
      data.aadhaar_number,
      data.bank_account_number,
      data.ifsc_code,
    ]
  );
  return result.rows[0] ?? null;
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await pool.query('DELETE FROM employee_profiles WHERE id = $1', [employeeId]);
}

// ── Employee Salary ─────────────────────────────────────────────────────────

export async function findSalaryByEmployeeId(employeeId: string): Promise<EmployeeSalary | null> {
  const result = await pool.query<EmployeeSalary>(
    'SELECT * FROM employee_salary WHERE employee_id = $1 LIMIT 1',
    [employeeId]
  );
  return result.rows[0] ?? null;
}

export async function createOrUpdateSalary(
  employeeId: string,
  data: {
    annual_salary: number;
    monthly_salary: number;
    basic_percentage?: number;
    hra_percentage?: number;
    pf_percentage?: number;
  }
): Promise<EmployeeSalary> {
  const result = await pool.query<EmployeeSalary>(
    `INSERT INTO employee_salary (employee_id, annual_salary, monthly_salary, basic_percentage, hra_percentage, pf_percentage)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (employee_id) DO UPDATE SET
       annual_salary = EXCLUDED.annual_salary,
       monthly_salary = EXCLUDED.monthly_salary,
       basic_percentage = EXCLUDED.basic_percentage,
       hra_percentage = EXCLUDED.hra_percentage,
       pf_percentage = EXCLUDED.pf_percentage,
       updated_at = NOW()
     RETURNING *`,
    [
      employeeId,
      data.annual_salary,
      data.monthly_salary,
      data.basic_percentage ?? 50,
      data.hra_percentage ?? 50,
      data.pf_percentage ?? 12,
    ]
  );
  return result.rows[0];
}
