'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { payPeriodLabel } from '@/utils/salaryUtils';

interface PayslipPreview {
  id: string;
  employee_name: string;
  employee_user_id: string;
  pay_period: string;
  net_payable: string;
  created_at: string;
}

export default function AdminPayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/payslips')
      .then(r => r.json())
      .then(d => setPayslips(d.payslips || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="top-header">
        <h2>Payslips</h2>
        <Link href="/admin/payslips/generate" className="btn btn-primary btn-sm"><i className="fi fi-rr-bolt"></i> Generate Payslip</Link>
      </div>
      
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>All Payslips</h1>
            <p>View and manage all generated employee payslips</p>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="empty-state">
              <span className="spinner dark" />
              <p style={{ marginTop: '12px' }}>Loading payslips…</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fi fi-rr-document"></i></div>
              <h3>No payslips generated</h3>
              <p>Generate a payslip to see it here</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Pay Period</th>
                  <th>Generated On</th>
                  <th>Net Payable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.employee_name}</td>
                    <td className="font-mono text-sm">{p.employee_user_id}</td>
                    <td>{p.pay_period}</td>
                    <td className="text-muted text-sm">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      ₹{parseFloat(p.net_payable).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <Link href={`/payslip/${p.id}/print`} target="_blank" className="btn btn-outline btn-sm">
                        <i className="fi fi-rr-eye"></i> View & Print
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
