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

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('month');
      if (m) setFilterMonth(m);
    }
  }, []);

  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this payslip?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/payslips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPayslips(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Failed to delete payslip');
      }
    } catch (err) {
      alert('Error deleting payslip');
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    fetch('/api/payslips')
      .then(r => r.json())
      .then(d => setPayslips(d.payslips || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredPayslips = payslips.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.employee_name.toLowerCase().includes(q) || p.employee_user_id.toLowerCase().includes(q);
    const matchesDate = !filterDate || p.created_at.startsWith(filterDate);
    const matchesMonth = !filterMonth || p.pay_period.toLowerCase().includes(filterMonth.toLowerCase());
    return matchesSearch && matchesDate && matchesMonth;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDate, filterMonth, rowsPerPage]);

  const totalPages = Math.ceil(filteredPayslips.length / rowsPerPage);
  const paginatedPayslips = filteredPayslips.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

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

        <div className="filters-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: '1 1 250px', minWidth: '200px', position: 'relative' }}>
            <span className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}><i className="fi fi-rr-search"></i></span>
            <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', width: '100%' }} className="form-input" />
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
              <p style={{ marginTop: '12px' }}>Loading payslips…</p>
            </div>
          ) : filteredPayslips.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fi fi-rr-document"></i></div>
              <h3>No payslips found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Employee</th>
                    <th>Pay Period</th>
                    <th>Generated On</th>
                    <th>Net Payable</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayslips.map((p, idx) => (
                    <tr key={p.id}>
                      <td>
                        <span className="table-row-num">{(currentPage - 1) * rowsPerPage + idx + 1}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem', flexShrink: 0 }}>
                            {p.employee_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{p.employee_name}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.employee_user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-employee" style={{ fontSize: '.75rem' }}>{p.pay_period}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '.8rem' }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '.95rem' }}>
                          ₹{parseFloat(p.net_payable).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Link href={`/payslip/${p.id}/print`} target="_blank" className="btn btn-outline btn-sm" title="View payslip">
                            <i className="fi fi-rr-eye"></i>
                          </Link>
                          <Link href={`/admin/payslips/${p.id}/edit`} className="btn btn-outline btn-sm" title="Edit payslip">
                            <i className="fi fi-rr-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-sm"
                            style={{ color: 'var(--danger)', background: 'var(--danger-light)', border: '1px solid #fecaca' }}
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            title="Delete payslip"
                          >
                            {deleting === p.id ? <span className="spinner dark" style={{ width: 13, height: 13, borderWidth: 2 }} /> : <i className="fi fi-rr-trash"></i>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-pagination">
                <span className="table-pagination-info">
                  Showing <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>–<strong>{Math.min(currentPage * rowsPerPage, filteredPayslips.length)}</strong> of <strong>{filteredPayslips.length}</strong> payslips
                </span>
                <div className="table-pagination-controls">
                  <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))}>
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                  <div className="table-pagination-pages">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>‹</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                      const page = start + i;
                      if (page > totalPages) return null;
                      return (
                        <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? 'page-current' : ''}>{page}</button>
                      );
                    })}
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0}>›</button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>»</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
