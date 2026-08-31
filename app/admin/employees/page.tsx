'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  designation?: string;
  department?: string;
  employment_status?: string;
  employment_type?: string;
  webwave_user_id: string;
  joining_date?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/employees')
      .then(r => r.json())
      .then(d => {
        setEmployees(d.employees ?? []);
        setFiltered(d.employees ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      employees.filter(e => {
        const matchesSearch = !q || e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.webwave_user_id.toLowerCase().includes(q) || (e.department ?? '').toLowerCase().includes(q);
        
        const joinStr = e.joining_date ? String(e.joining_date) : '';
        const matchesDate = !filterDate || joinStr.startsWith(filterDate);
        
        let matchesMonth = true;
        if (filterMonth && joinStr) {
          const mNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const mIndex = mNames.indexOf(filterMonth) + 1;
          const mStr = mIndex.toString().padStart(2, '0');
          // Fallback parsing just in case
          let monthPart = '';
          if (joinStr.includes('-')) {
            monthPart = joinStr.split('-')[1];
          } else {
            monthPart = new Date(joinStr).getMonth() + 1 + '';
            monthPart = monthPart.padStart(2, '0');
          }
          matchesMonth = (monthPart === mStr);
        } else if (filterMonth && !joinStr) {
          matchesMonth = false;
        }

        return matchesSearch && matchesDate && matchesMonth;
      })
    );
  }, [search, filterDate, filterMonth, employees]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' });
      if (res.ok) setEmployees(prev => prev.filter(e => e.id !== id));
      else alert('Failed to delete employee.');
    } finally {
      setDeleting(null);
    }
  }

  const statusBadge = (s?: string) => {
    if (s === 'Active') return <span className="badge badge-active">Active</span>;
    if (s === 'Inactive') return <span className="badge badge-inactive">Inactive</span>;
    return <span className="badge badge-warning">{s ?? 'Unknown'}</span>;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDate, filterMonth, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedEmployees = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <div className="top-header">
        <h2>Employees</h2>
        <Link href="/admin/employees/new" className="btn btn-primary btn-sm">+ Add Employee</Link>
      </div>

      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>All Employees</h1>
            <p>{employees.length} employees registered</p>
          </div>
        </div>

        <div className="filters-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: '1 1 250px', minWidth: '200px', position: 'relative' }}>
            <span className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}><i className="fi fi-rr-search"></i></span>
            <input type="text" placeholder="Search by name, ID, department..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', width: '100%' }} className="form-input" />
          </div>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="form-input" style={{ width: 'auto' }} title="Filter by joining date" />
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="form-input" style={{ width: 'auto' }}>
            <option value="">All Months (Joining)</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="empty-state">
              <span className="spinner dark" />
              <p style={{ marginTop: '12px' }}>Loading employees…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon"><i className="fi fi-rr-users"></i></div>
              <h3>{search ? 'No results found' : 'No employees yet'}</h3>
              <p>{search ? 'Try a different search term' : 'Create your first employee to get started'}</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Employee</th>
                    <th>User ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((emp, idx) => (
                    <tr key={emp.id}>
                      <td>
                        <span className="table-row-num">{(currentPage - 1) * rowsPerPage + idx + 1}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '.75rem', flexShrink: 0 }}>
                            {emp.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{emp.full_name}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono" style={{ fontSize: '.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {emp.webwave_user_id}
                      </td>
                      <td className="text-sm">{emp.department || '—'}</td>
                      <td className="text-sm">{emp.designation || '—'}</td>
                      <td>{statusBadge(emp.employment_status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Link href={`/admin/employees/${emp.id}/edit`} className="btn btn-outline btn-sm" title="Edit employee">
                            <i className="fi fi-rr-pencil"></i>
                          </Link>
                          <Link href={`/admin/payslips/generate?employee=${emp.id}`} className="btn btn-outline btn-sm" title="Generate payslip">
                            <i className="fi fi-rr-document"></i>
                          </Link>
                          <button
                            className="btn btn-sm"
                            style={{ color: 'var(--danger)', background: 'var(--danger-light)', border: '1px solid #fecaca' }}
                            onClick={() => handleDelete(emp.id, emp.full_name)}
                            disabled={deleting === emp.id}
                            title="Delete employee"
                          >
                            {deleting === emp.id ? <span className="spinner dark" style={{ width: 13, height: 13, borderWidth: 2 }} /> : <i className="fi fi-rr-trash"></i>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-pagination">
                <span className="table-pagination-info">
                  Showing <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>–<strong>{Math.min(currentPage * rowsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> employees
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
