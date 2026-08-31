import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAllTaxSlabs } from '@/services/tax.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const slabs = await getAllTaxSlabs();
    return Response.json({ slabs });
  } catch (err) {
    if (err instanceof Response) return err;
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
