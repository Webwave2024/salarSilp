export interface EmployeeProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  dob?: string;
  contact_number?: string;
  gender?: string;
  address?: string;
  joining_date?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  employment_type?: string;
  employment_status?: string;
  pan_number?: string;
  aadhaar_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmployeeWithUser extends EmployeeProfile {
  webwave_user_id: string; // WEBWAVE-XXXXX
  role: string;
}

export interface EmployeeSalary {
  id: string;
  employee_id: string;
  annual_salary: number;
  monthly_salary: number;
  basic_percentage: number;
  hra_percentage: number;
  pf_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmployeeInput {
  // Personal
  full_name: string;
  email: string;
  dob?: string;
  contact_number?: string;
  gender?: string;
  address?: string;
  // Employment
  joining_date?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  employment_type?: string;
  employment_status?: string;
  // Salary
  annual_salary: number;
  monthly_salary: number;
  // Documents
  pan_number?: string;
  aadhaar_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  // Auth
  password: string;
}
