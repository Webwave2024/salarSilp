import pool from '@/lib/db';
import type { CompanySettings } from '@/types/salary';

export async function GET() {
  try {
    const result = await pool.query<CompanySettings>(
      'SELECT * FROM company_settings LIMIT 1'
    );
    return Response.json({ company: result.rows[0] ?? null });
  } catch (err) {
    console.error('Company settings error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
