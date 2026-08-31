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

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    fetch('/api/payslips')
      .then(r => r.json())
      .then(d => setPayslips(d.payslips || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredPayslips = payslips.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.pay_period.toLowerCase().includes(q) || p.net_payable.toLowerCase().includes(q);
    const matchesDate = !filterDate || p.created_at.startsWith(filterDate);
    const matchesMonth = !filterMonth || p.pay_period.toLowerCase().includes(filterMonth.toLowerCase());
    return matchesSearch && matchesDate && matchesMonth;
  });

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

        <div className="filters-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: '1 1 250px', minWidth: '200px', position: 'relative' }}>
            <span className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}><i className="fi fi-rr-search"></i></span>
            <input type="text" placeholder="Search by pay period or amount..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', width: '100%' }} className="form-input" />
          </div>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="form-input" style={{ width: 'auto' }} title="Filter by generation date" />
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="form-input" style={{ width: 'auto' }}>
            <option value="">All Months</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="empty-state">
              <span className="spinner dark" />
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fi fi-rr-document"></i></div>
              <h3>No payslips found</h3>
              <p>Try adjusting your filters</p>
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
                {filteredPayslips.map(p => (
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
