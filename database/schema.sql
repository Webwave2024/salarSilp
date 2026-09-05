-- Employee Payslip CRM - PostgreSQL Schema
-- Run: psql $DATABASE_URL -f database/schema.sql

-- Enable UUID extension
-- Extension removed, using native gen_random_uuid()

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     VARCHAR(20) UNIQUE NOT NULL,   -- e.g. WEBWAVE-28282
  password    TEXT NOT NULL,                  -- plain text (isolated for future hashing)
  role        VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- employee_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name           VARCHAR(255) NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  dob                 DATE,
  contact_number      VARCHAR(20),
  gender              VARCHAR(20),
  address             TEXT,
  joining_date        DATE,
  designation         VARCHAR(255),
  department          VARCHAR(255),
  qualification       VARCHAR(255),
  employment_type     VARCHAR(50),           -- Full-time, Part-time, Contract, Intern
  employment_status   VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Terminated
  pan_number          VARCHAR(20),
  aadhaar_number      VARCHAR(20),
  bank_account_number VARCHAR(50),
  ifsc_code           VARCHAR(20),
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- employee_salary
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_salary (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID UNIQUE NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  annual_salary    NUMERIC(15,2) NOT NULL DEFAULT 0,
  monthly_salary   NUMERIC(15,2) NOT NULL DEFAULT 0,
  basic_percentage NUMERIC(5,2)  NOT NULL DEFAULT 50.00,  -- % of monthly salary
  hra_percentage   NUMERIC(5,2)  NOT NULL DEFAULT 50.00,  -- % of basic salary
  pf_percentage    NUMERIC(5,2)  NOT NULL DEFAULT 12.00,  -- % of basic salary
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- payslips
-- ============================================================
CREATE TABLE IF NOT EXISTS payslips (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  pay_period       VARCHAR(20) NOT NULL,       -- e.g. "August 2026"
  pay_period_year  INTEGER NOT NULL,
  pay_period_month INTEGER NOT NULL,
  paid_days        NUMERIC(5,2) NOT NULL DEFAULT 0,
  working_days     NUMERIC(5,2) NOT NULL DEFAULT 26,
  loss_of_pay_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  pending_leave_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  pay_date         DATE NOT NULL,
  gross_earnings   NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
  net_payable      NUMERIC(15,2) NOT NULL DEFAULT 0,
  amount_in_words  TEXT,
  monthly_salary_snapshot NUMERIC(15,2) NOT NULL DEFAULT 0,  -- snapshot at time of generation
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- payslip_earnings  (dynamic line items)
-- ============================================================
CREATE TABLE IF NOT EXISTS payslip_earnings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id  UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
  field_name  VARCHAR(255) NOT NULL,
  amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_auto     BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = Basic/HRA (calculated), FALSE = manual
  sort_order  INTEGER DEFAULT 0
);

-- ============================================================
-- payslip_deductions  (dynamic line items)
-- ============================================================
CREATE TABLE IF NOT EXISTS payslip_deductions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id  UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
  field_name  VARCHAR(255) NOT NULL,
  amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_auto     BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = TDS/PF (calculated), FALSE = manual
  sort_order  INTEGER DEFAULT 0
);

-- ============================================================
-- payslip_summary_fields  (custom "Add another field" in Pay Summary)
-- ============================================================
CREATE TABLE IF NOT EXISTS payslip_summary_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id  UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
  field_name  VARCHAR(255) NOT NULL,
  field_value TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- ============================================================
-- tax_slabs  (configurable TDS calculation)
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_slabs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_year VARCHAR(10) NOT NULL,       -- e.g. "2025-26"
  regime         VARCHAR(20) NOT NULL DEFAULT 'new', -- 'new' or 'old'
  min_income     NUMERIC(15,2) NOT NULL DEFAULT 0,
  max_income     NUMERIC(15,2),              -- NULL means no upper limit
  tax_rate       NUMERIC(5,2) NOT NULL DEFAULT 0,  -- percentage
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- company_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL DEFAULT 'WebWave Technologies',
  logo_url     TEXT,
  address      TEXT,
  city         VARCHAR(100),
  state        VARCHAR(100),
  pincode      VARCHAR(10),
  email        VARCHAR(255),
  phone        VARCHAR(20),
  website      VARCHAR(255),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_pay_period ON payslips(pay_period_year, pay_period_month);
CREATE INDEX IF NOT EXISTS idx_payslip_earnings_payslip_id ON payslip_earnings(payslip_id);
CREATE INDEX IF NOT EXISTS idx_payslip_deductions_payslip_id ON payslip_deductions(payslip_id);
CREATE INDEX IF NOT EXISTS idx_tax_slabs_active ON tax_slabs(active, financial_year);
