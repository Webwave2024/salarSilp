-- Employee Payslip CRM - Seed Data
-- Run AFTER schema.sql: psql $DATABASE_URL -f database/seed.sql
-- ⚠️  CHANGE admin password before production!

-- ============================================================
-- Default Admin User
-- ============================================================
INSERT INTO users (id, user_id, password, role)
VALUES (
  uuid_generate_v4(),
  'WEBWAVE-ADMIN',
  'admin123',   -- ⚠️  plain text as required; change before production
  'ADMIN'
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- Default Company Settings
-- ============================================================
INSERT INTO company_settings (company_name, address, city, state, pincode, email, phone, website)
VALUES (
  'WebWave Technologies',
  '123, Tech Park, Sector 5',
  'Mumbai',
  'Maharashtra',
  '400001',
  'hr@webwave.in',
  '+91 98765 43210',
  'https://webwave.in'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- FY 2025-26 New Regime Tax Slabs (India)
-- Source: Union Budget 2025-26
-- ============================================================
INSERT INTO tax_slabs (financial_year, regime, min_income, max_income, tax_rate, active)
VALUES
  ('2025-26', 'new',        0,   400000, 0,   TRUE),
  ('2025-26', 'new',   400001,   800000, 5,   TRUE),
  ('2025-26', 'new',   800001,  1200000, 10,  TRUE),
  ('2025-26', 'new',  1200001,  1600000, 15,  TRUE),
  ('2025-26', 'new',  1600001,  2000000, 20,  TRUE),
  ('2025-26', 'new',  2000001,  2400000, 25,  TRUE),
  ('2025-26', 'new',  2400001,      NULL, 30,  TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- FY 2025-26 Old Regime Tax Slabs (India)
-- ============================================================
INSERT INTO tax_slabs (financial_year, regime, min_income, max_income, tax_rate, active)
VALUES
  ('2025-26', 'old',        0,   250000, 0,   FALSE),
  ('2025-26', 'old',   250001,   500000, 5,   FALSE),
  ('2025-26', 'old',   500001,  1000000, 20,  FALSE),
  ('2025-26', 'old',  1000001,      NULL, 30,  FALSE)
ON CONFLICT DO NOTHING;
