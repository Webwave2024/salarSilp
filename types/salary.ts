export interface SalaryBreakdown {
  monthlySalary: number;
  basic: number;
  hra: number;
  grossEarnings: number;
  tds: number;
  pf: number;
  totalDeductions: number;
  netPayable: number;
}

export interface TaxSlab {
  id: string;
  financial_year: string;
  regime: string;
  min_income: number;
  max_income: number | null;
  tax_rate: number;
  active: boolean;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  phone?: string;
  website?: string;
}
