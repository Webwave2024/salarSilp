'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface FormData {
  full_name: string; email: string; dob: string; contact_number: string;
  gender: string; address: string; joining_date: string; designation: string;
  department: string; qualification: string; employment_type: string;
  employment_status: string; annual_salary: string; monthly_salary: string;
  pan_number: string; aadhaar_number: string; bank_account_number: string;
  ifsc_code: string;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/employees/${id}`)
      .then(r => r.json())
      .then(d => {
        const e = d.employee;
        const s = d.salary;
        setForm({
          full_name: e.full_name || '',
          email: e.email || '',
          dob: e.dob ? e.dob.split('T')[0] : '',
          contact_number: e.contact_number || '',
          gender: e.gender || '',
          address: e.address || '',
          joining_date: e.joining_date ? e.joining_date.split('T')[0] : '',
          designation: e.designation || '',
          department: e.department || '',
          qualification: e.qualification || '',
          employment_type: e.employment_type || 'Full-time',
          employment_status: e.employment_status || 'Active',
          annual_salary: s?.annual_salary ? String(s.annual_salary) : '',
          monthly_salary: s?.monthly_salary ? String(s.monthly_salary) : '',
          pan_number: e.pan_number || '',
          aadhaar_number: e.aadhaar_number || '',
          bank_account_number: e.bank_account_number || '',
          ifsc_code: e.ifsc_code || '',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => prev ? { ...prev, [k]: e.target.value } : null);

  const onMonthlySalary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monthly = e.target.value;
    setForm(prev => prev ? { ...prev, monthly_salary: monthly, annual_salary: monthly ? String(Math.round(parseFloat(monthly) * 12)) : '' } : null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          annual_salary: parseFloat(form.annual_salary) || 0,
          monthly_salary: parseFloat(form.monthly_salary) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Update failed'); return; }
      setSuccess(true);
      setTimeout(() => router.push('/admin/employees'), 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <>
      <div className="top-header"><h2>Edit Employee</h2></div>
      <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span className="spinner dark" />
      </div>
    </>
  );

  if (!form) return (
    <>
      <div className="top-header"><h2>Edit Employee</h2></div>
      <div className="page-body"><div className="alert alert-error">Employee not found.</div></div>
    </>
  );

  return (
    <>
      <div className="top-header"><h2>Edit Employee</h2></div>
      <div className="page-body">
        <div className="page-header">
          <div><h1>Edit Employee</h1><p>Update employee information</p></div>
        </div>

        {error && <div className="alert alert-error"><span><i className="fi fi-rr-warning"></i></span><span>{error}</span></div>}
        {success && <div className="alert alert-success"><span><i className="fi fi-rr-check"></i></span><span>Employee updated! Redirecting…</span></div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-user"></i> Personal Information</div>
            <div className="form-grid">
              <div className="form-group"><label>Full Name <span className="required">*</span></label>
                <input type="text" value={form.full_name} onChange={set('full_name')} required /></div>
              <div className="form-group"><label>Email <span className="required">*</span></label>
                <input type="email" value={form.email} onChange={set('email')} required /></div>
              <div className="form-group"><label>Date of Birth</label>
                <input type="date" value={form.dob} onChange={set('dob')} /></div>
              <div className="form-group"><label>Contact Number</label>
                <input type="tel" value={form.contact_number} onChange={set('contact_number')} /></div>
              <div className="form-group"><label>Gender</label>
                <select value={form.gender} onChange={set('gender')}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select></div>
              <div className="form-group"><label>Address</label>
                <textarea value={form.address} onChange={set('address')} rows={2} style={{ resize: 'none' }} /></div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-building"></i> Employment Information</div>
            <div className="form-grid">
              <div className="form-group"><label>Joining Date</label>
                <input type="date" value={form.joining_date} onChange={set('joining_date')} /></div>
              <div className="form-group"><label>Designation</label>
                <input type="text" value={form.designation} onChange={set('designation')} /></div>
              <div className="form-group"><label>Department</label>
                <input type="text" value={form.department} onChange={set('department')} /></div>
              <div className="form-group"><label>Qualification</label>
                <input type="text" value={form.qualification} onChange={set('qualification')} /></div>
              <div className="form-group"><label>Employment Type</label>
                <select value={form.employment_type} onChange={set('employment_type')}>
                  <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                </select></div>
              <div className="form-group"><label>Status</label>
                <select value={form.employment_status} onChange={set('employment_status')}>
                  <option>Active</option><option>Inactive</option><option>On Leave</option><option>Terminated</option>
                </select></div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-money-bill-wave"></i> Salary</div>
            <div className="form-grid">
              <div className="form-group"><label>Monthly Salary (₹)</label>
                <input type="number" value={form.monthly_salary} onChange={onMonthlySalary} min="0" /></div>
              <div className="form-group"><label>Annual Salary (₹)</label>
                <input type="number" value={form.annual_salary} onChange={set('annual_salary')} min="0" /></div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-clipboard-list"></i> Documents & Banking</div>
            <div className="form-grid">
              <div className="form-group"><label>PAN Number</label>
                <input type="text" value={form.pan_number} onChange={set('pan_number')} /></div>
              <div className="form-group"><label>Aadhaar Number</label>
                <input type="text" value={form.aadhaar_number} onChange={set('aadhaar_number')} /></div>
              <div className="form-group"><label>Bank Account Number</label>
                <input type="text" value={form.bank_account_number} onChange={set('bank_account_number')} /></div>
              <div className="form-group"><label>IFSC Code</label>
                <input type="text" value={form.ifsc_code} onChange={set('ifsc_code')} /></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingBottom: '32px' }}>
            <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : <><i className="fi fi-rr-check"></i> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
