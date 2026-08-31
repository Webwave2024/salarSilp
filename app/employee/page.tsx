'use client';

import { useEffect, useState } from 'react';
import type { EmployeeProfile, EmployeeSalary } from '@/types/employee';

interface DashboardData {
  userId: string;
  profile: EmployeeProfile;
  salary: EmployeeSalary | null;
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-body"><span className="spinner dark" /></div>;
  if (!data || !data.profile) return <div className="page-body"><div className="alert alert-error">Profile not found.</div></div>;

  const { profile, salary, userId } = data;

  return (
    <>
      <div className="top-header">
        <h2>Dashboard</h2>
      </div>

      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>Welcome back, {profile.full_name.split(' ')[0]} <i className="fi fi-rr-hand-wave"></i></h1>
            <p>Here is an overview of your employment details.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="card">
            <div className="card-title">Profile Information</div>
            <div className="payslip-meta" style={{ gridTemplateColumns: '1fr', background: 'transparent', padding: 0, marginTop: '20px' }}>
              <div className="payslip-meta-item">
                <div className="label">Full Name</div>
                <div className="value">{profile.full_name}</div>
              </div>
              <div className="payslip-meta-item mt-4">
                <div className="label">Employee ID</div>
                <div className="value font-mono text-primary">{userId}</div>
              </div>
              <div className="payslip-meta-item mt-4">
                <div className="label">Email Address</div>
                <div className="value">{profile.email}</div>
              </div>
              <div className="payslip-meta-item mt-4">
                <div className="label">Contact Number</div>
                <div className="value">{profile.contact_number || '—'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Employment Details</div>
            <div className="payslip-meta" style={{ gridTemplateColumns: '1fr', background: 'transparent', padding: 0, marginTop: '20px' }}>
              <div className="payslip-meta-item">
                <div className="label">Designation</div>
                <div className="value">{profile.designation || '—'}</div>
              </div>
              <div className="payslip-meta-item mt-4">
                <div className="label">Department</div>
                <div className="value">{profile.department || '—'}</div>
              </div>
              <div className="payslip-meta-item mt-4">
                <div className="label">Date of Joining</div>
                <div className="value">{profile.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-IN') : '—'}</div>
              </div>
              <div className="payslip-meta-item mt-4">
                <div className="label">Current Salary</div>
                <div className="value" style={{ color: 'var(--success)' }}>
                  {salary ? `₹${parseFloat(String(salary.annual_salary)).toLocaleString('en-IN')} / year` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
