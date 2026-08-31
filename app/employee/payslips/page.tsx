'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PayslipPreview {
  id: string;
  pay_period: string;
  net_payable: string;
  created_at: string;
}

export default function MyPayslipsPage() {
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
        <h2>My Payslips</h2>
      </div>
      
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>My Payslips</h1>
            <p>View and download your salary slips</p>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="empty-state">
              <span className="spinner dark" />
            </div>
          ) : payslips.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fi fi-rr-document"></i></div>
              <h3>No payslips available</h3>
              <p>Your generated payslips will appear here.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pay Period</th>
                  <th>Generated On</th>
                  <th>Net Payable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.pay_period}</td>
                    <td className="text-muted text-sm">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>
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
