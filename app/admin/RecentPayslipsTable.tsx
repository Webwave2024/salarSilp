'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecentPayslipsTable({ payslips }: { payslips: any[] }) {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  if (payslips.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon"><i className="fi fi-rr-clipboard-list"></i></div>
        <h3>No payslips yet</h3>
        <p>Generate your first payslip to see it here</p>
      </div>
    );
  }

  const filtered = payslips.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.employee_name.toLowerCase().includes(q) || p.pay_period.toLowerCase().includes(q);
    const dateStr = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '';
    const matchesDate = !filterDate || dateStr === filterDate;
    const matchesMonth = !filterMonth || p.pay_period.toLowerCase().includes(filterMonth.toLowerCase());
    return matchesSearch && matchesDate && matchesMonth;
  });

  return (
    <>
      <div className="filters-row" style={{ display: 'flex', gap: '12px', marginBottom: '12px', padding: '0 20px', flexWrap: 'wrap' }}>
        <div className="search-input-wrap" style={{ flex: '1 1 250px', minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }}><i className="fi fi-rr-search"></i></span>
          <input type="text" placeholder="Search by name or pay period..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', width: '100%' }} className="form-input" />
        </div>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="form-input" style={{ width: 'auto' }} title="Filter by generation date" />
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="form-input" style={{ width: 'auto' }}>
          <option value="">All Months</option>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px' }}>
          <div className="icon"><i className="fi fi-rr-clipboard-list"></i></div>
          <h3>No payslips found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Employee</th>
              <th>Pay Period</th>
              <th>Net Payable</th>
              <th>Generated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any, idx: number) => (
              <tr key={p.id}>
                <td><span className="table-row-num">{idx + 1}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '.72rem', flexShrink: 0 }}>
                      {p.employee_name?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{p.employee_name}</span>
                  </div>
                </td>
                <td>
                  <span className="badge badge-employee" style={{ fontSize: '.73rem' }}>{p.pay_period}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '.9rem' }}>
                    ₹{parseFloat(p.net_payable).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '.8rem' }}>
                  {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <Link href={`/payslip/${p.id}/print`} className="btn btn-outline btn-sm" target="_blank" title="View payslip">
                      <i className="fi fi-rr-eye"></i>
                    </Link>
                    <Link href={`/admin/payslips/${p.id}/edit`} className="btn btn-outline btn-sm" title="Edit payslip">
                      <i className="fi fi-rr-pencil"></i>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

