import pool from '@/lib/db';
import { createUser } from '@/repositories/user.repository';
import { createEmployeeProfile, createOrUpdateSalary, findAllEmployees, findActiveEmployees, findEmployeeById } from '@/repositories/employee.repository';
import { generateUserId } from '@/utils/generateUserId';
import type { CreateEmployeeInput, EmployeeWithUser } from '@/types/employee';
import type { EmployeeSalary } from '@/types/employee';

export interface CreateEmployeeResult {
  userId: string;       // WEBWAVE-XXXXX
  employeeId: string;   // UUID
  full_name: string;
}

export async function createEmployee(data: CreateEmployeeInput): Promise<CreateEmployeeResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Generate unique WEBWAVE-XXXXX
    const userId = await generateUserId();

    // Create user
    const user = await createUser({
      user_id: userId,
      password: data.password,
      role: 'EMPLOYEE',
    });

    // Create employee profile
    const profile = await createEmployeeProfile(user.id, data);

    // Create salary record
    await createOrUpdateSalary(profile.id, {
      annual_salary: data.annual_salary,
      monthly_salary: data.monthly_salary,
    });

    await client.query('COMMIT');

    return {
      userId,
      employeeId: profile.id,
      full_name: data.full_name,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getEmployeeWithSalary(employeeId: string): Promise<{
  employee: EmployeeWithUser;
  salary: EmployeeSalary | null;
} | null> {
  const employee = await findEmployeeById(employeeId);
  if (!employee) return null;

  const salaryResult = await pool.query<EmployeeSalary>(
    'SELECT * FROM employee_salary WHERE employee_id = $1',
    [employeeId]
  );

  return { employee, salary: salaryResult.rows[0] ?? null };
}

export async function listEmployees(): Promise<EmployeeWithUser[]> {
  return findAllEmployees();
}

export async function listActiveEmployees(): Promise<EmployeeWithUser[]> {
  return findActiveEmployees();
}
