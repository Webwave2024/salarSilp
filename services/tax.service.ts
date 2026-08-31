import pool from '@/lib/db';
import type { TaxSlab } from '@/types/salary';

/**
 * Fetch active tax slabs for the current financial year.
 * Defaults to "new" regime (FY 2025-26).
 */
export async function getTaxSlabs(
  financial_year = '2025-26',
  regime = 'new'
): Promise<TaxSlab[]> {
  const result = await pool.query<TaxSlab>(
    `SELECT * FROM tax_slabs
     WHERE active = TRUE AND financial_year = $1 AND regime = $2
     ORDER BY min_income ASC`,
    [financial_year, regime]
  );
  return result.rows;
}

export async function getAllTaxSlabs(): Promise<TaxSlab[]> {
  const result = await pool.query<TaxSlab>(
    'SELECT * FROM tax_slabs ORDER BY financial_year DESC, regime, min_income ASC'
  );
  return result.rows;
}
