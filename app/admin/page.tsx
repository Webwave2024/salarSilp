import pool from '@/lib/db';
import Link from 'next/link';
import RecentPayslipsTable from './RecentPayslipsTable';

async function getDashboardStats() {
  const [empCount, payslipCount, thisMonthCount] = await Promise.all([
    pool.query<{ count: string }>(
      `SELECT COUNT(ep.*) as count 
       FROM employee_profiles ep
       JOIN users u ON ep.user_id = u.id
       WHERE u.role != 'ADMIN'`
    ),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM payslips'),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM payslips
       WHERE pay_period_year = EXTRACT(YEAR FROM NOW())
         AND pay_period_month = EXTRACT(MONTH FROM NOW())`
    ),
  ]);

  const recentPayslips = await pool.query<{
    id: string; pay_period: string; employee_name: string;
    net_payable: string; created_at: Date;
  }>(
    `SELECT p.id, p.pay_period, ep.full_name as employee_name,
            p.net_payable, p.created_at
     FROM payslips p
     JOIN employee_profiles ep ON p.employee_id = ep.id
     ORDER BY p.created_at DESC LIMIT 5`
  );

  return {
    employeeCount: parseInt(empCount.rows[0].count),
    payslipCount: parseInt(payslipCount.rows[0].count),
    thisMonthCount: parseInt(thisMonthCount.rows[0].count),
    recentPayslips: recentPayslips.rows,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <>
      <div className="top-header">
        <h2>Dashboard</h2>
        <div className="header-user">
          <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>Welcome back <i className="fi fi-rr-hand-wave"></i></h1>
            <p>Here's what's happening with your payroll today.</p>
          </div>
          <Link href="/admin/payslips/generate" className="btn btn-primary">
            <i className="fi fi-rr-bolt"></i> Generate Payslip
          </Link>
        </div>

        <div className="stats-grid">
          <Link href="/admin/employees" className="stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: '#eff6ff', fontSize: '1.4rem' }}><i className="fi fi-rr-users"></i></div>
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{stats.employeeCount}</div>
            <div className="stat-badge blue">Active</div>
          </Link>

          <Link href="/admin/payslips" className="stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: '#f0fdf4', fontSize: '1.4rem' }}><i className="fi fi-rr-document"></i></div>
            <div className="stat-label">Total Payslips</div>
            <div className="stat-value">{stats.payslipCount}</div>
            <div className="stat-badge green">All Time</div>
          </Link>

          <Link href={`/admin/payslips?month=${new Date().toLocaleDateString('en-IN', { month: 'long' })}`} className="stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: '#fff7ed', fontSize: '1.4rem' }}><i className="fi fi-rr-calendar"></i></div>
            <div className="stat-label">This Month</div>
            <div className="stat-value">{stats.thisMonthCount}</div>
            <div className="stat-badge blue">Payslips</div>
          </Link>
        </div>

        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">Recent Payslips</div>
              <div className="card-subtitle" style={{ marginBottom: 0 }}>Latest payslip generations</div>
            </div>
            <Link href="/admin/payslips" className="btn btn-outline btn-sm">View All</Link>
          </div>

          <RecentPayslipsTable payslips={stats.recentPayslips} />
        </div>
      </div>
    </>
  );
}
