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
      employees.filter(e =>
        e.full_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.webwave_user_id.toLowerCase().includes(q) ||
        (e.department ?? '').toLowerCase().includes(q)
      )
    );
  }, [search, employees]);

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

        <div className="search-bar" style={{ marginBottom: '16px' }}>
          <div className="search-input-wrap" style={{ maxWidth: '400px' }}>
            <span className="search-icon"><i className="fi fi-rr-search"></i></span>
            <input
              type="text"
              placeholder="Search by name, ID, department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
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
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>User ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
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
                    <td className="text-sm text-muted">{emp.employment_type || '—'}</td>
                    <td>{statusBadge(emp.employment_status)}</td>
                    <td>
                      <div className="action-group">
                        <Link href={`/admin/employees/${emp.id}/edit`} className="btn btn-outline btn-sm">
                          <i className="fi fi-rr-pencil"></i> Edit
                        </Link>
                        <Link href={`/admin/payslips/generate?employee=${emp.id}`} className="btn btn-outline btn-sm">
                          <i className="fi fi-rr-document"></i> Payslip
                        </Link>
                        <button
                          className="btn btn-sm"
                          style={{ color: 'var(--danger)', background: 'var(--danger-light)', border: '1px solid #fecaca' }}
                          onClick={() => handleDelete(emp.id, emp.full_name)}
                          disabled={deleting === emp.id}
                        >
                          {deleting === emp.id ? <span className="spinner dark" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <i className="fi fi-rr-trash"></i>}
                        </button>
                      </div>
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
