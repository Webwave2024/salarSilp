'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  full_name: string; email: string; dob: string; contact_number: string;
  gender: string; address: string; joining_date: string; designation: string;
  department: string; qualification: string; employment_type: string;
  employment_status: string; annual_salary: string; monthly_salary: string;
  pan_number: string; aadhaar_number: string; bank_account_number: string;
  ifsc_code: string; password: string;
}

interface CreatedEmployee { userId: string; name: string; password: string; }

const INITIAL: FormData = {
  full_name: '', email: '', dob: '', contact_number: '', gender: '', address: '',
  joining_date: '', designation: '', department: '', qualification: '',
  employment_type: 'Full-time', employment_status: 'Active',
  annual_salary: '', monthly_salary: '', pan_number: '', aadhaar_number: '',
  bank_account_number: '', ifsc_code: '', password: '',
};

export default function CreateEmployeePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatedEmployee | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  // Auto-calculate annual from monthly and vice-versa
  const onMonthlySalary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monthly = e.target.value;
    setForm(prev => ({
      ...prev,
      monthly_salary: monthly,
      annual_salary: monthly ? String(Math.round(parseFloat(monthly) * 12)) : '',
    }));
  };

  const onAnnualSalary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const annual = e.target.value;
    setForm(prev => ({
      ...prev,
      annual_salary: annual,
      monthly_salary: annual ? String(Math.round(parseFloat(annual) / 12)) : '',
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          annual_salary: parseFloat(form.annual_salary) || 0,
          monthly_salary: parseFloat(form.monthly_salary) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create employee');
        return;
      }
      setCreated({ userId: data.user.userId, name: data.user.name, password: form.password });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (created) {
    return (
      <>
        <div className="top-header"><h2>Employee Created</h2></div>
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
          <div className="modal" style={{ maxWidth: '460px', width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <div className="modal-icon"><i className="fi fi-rr-check"></i></div>
            <h3>Employee Created Successfully!</h3>
            <p>Share these login credentials with the employee securely.</p>

            <div className="credential-box">
              <div className="credential-row">
                <div>
                  <div className="credential-label">Employee Name</div>
                  <div className="credential-value">{created.name}</div>
                </div>
              </div>
              <div className="credential-row">
                <div>
                  <div className="credential-label">User ID</div>
                  <div className="credential-value">{created.userId}</div>
                </div>
                <button className="copy-btn" onClick={() => copy(created.userId, 'uid')}>
                  {copied === 'uid' ? <><i className="fi fi-rr-check"></i> Copied</> : 'Copy'}
                </button>
              </div>
              <div className="credential-row">
                <div>
                  <div className="credential-label">Password</div>
                  <div className="credential-value">{created.password}</div>
                </div>
                <button className="copy-btn" onClick={() => copy(created.password, 'pwd')}>
                  {copied === 'pwd' ? <><i className="fi fi-rr-check"></i> Copied</> : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setCreated(null); setForm(INITIAL); }}>
                + Add Another
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push('/admin/employees')}>
                View All Employees
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="top-header">
        <h2>Create Employee</h2>
      </div>
      <div className="page-body">
        <div className="page-header">
          <div><h1>New Employee</h1><p>Fill in the employee's information below</p></div>
        </div>

        {error && <div className="alert alert-error"><span><i className="fi fi-rr-warning"></i></span><span>{error}</span></div>}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-user"></i> Personal Information</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input type="text" value={form.full_name} onChange={set('full_name')} required placeholder="Rahul Kumar" />
              </div>
              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="rahul@company.com" />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={form.dob} onChange={set('dob')} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="tel" value={form.contact_number} onChange={set('contact_number')} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={set('gender')}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={set('address')} placeholder="123, Street, City, State" rows={2} style={{ resize: 'none' }} />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-building"></i> Employment Information</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Joining Date</label>
                <input type="date" value={form.joining_date} onChange={set('joining_date')} />
              </div>
              <div className="form-group">
                <label>Designation / Role</label>
                <input type="text" value={form.designation} onChange={set('designation')} placeholder="Software Engineer" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={form.department} onChange={set('department')} placeholder="Engineering" />
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <input type="text" value={form.qualification} onChange={set('qualification')} placeholder="B.Tech Computer Science" />
              </div>
              <div className="form-group">
                <label>Employment Type</label>
                <select value={form.employment_type} onChange={set('employment_type')}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Freelance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Employee Status</label>
                <select value={form.employment_status} onChange={set('employment_status')}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>On Leave</option>
                  <option>Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-money-bill-wave"></i> Salary Information</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Monthly Salary (₹) <span className="required">*</span></label>
                <input type="number" value={form.monthly_salary} onChange={onMonthlySalary} required min="0" placeholder="50000" />
                <span className="field-error" style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>
                  Annual will auto-calculate
                </span>
              </div>
              <div className="form-group">
                <label>Annual Salary (₹) <span className="required">*</span></label>
                <input type="number" value={form.annual_salary} onChange={onAnnualSalary} required min="0" placeholder="600000" />
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', fontSize: '.8rem', color: 'var(--primary)' }}>
              ℹ️ Basic = 50% of monthly salary · HRA = 50% of Basic · PF = 12% of Basic
            </div>
          </div>

          {/* Documents */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-clipboard-list"></i> Documents & Banking</div>
            <div className="form-grid">
              <div className="form-group">
                <label>PAN Number</label>
                <input type="text" value={form.pan_number} onChange={set('pan_number')} placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Aadhaar Number</label>
                <input type="text" value={form.aadhaar_number} onChange={set('aadhaar_number')} placeholder="XXXX XXXX XXXX" />
              </div>
              <div className="form-group">
                <label>Bank Account Number</label>
                <input type="text" value={form.bank_account_number} onChange={set('bank_account_number')} placeholder="1234567890" />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input type="text" value={form.ifsc_code} onChange={set('ifsc_code')} placeholder="SBIN0001234" style={{ textTransform: 'uppercase' }} />
              </div>
            </div>
          </div>

          {/* Login */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-lock"></i> Login Credentials</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <input type="text" value={form.password} onChange={set('password')} required placeholder="Set a password for the employee" minLength={4} />
                <span className="field-error" style={{ color: 'var(--text-muted)', fontSize: '.72rem' }}>
                  User ID (WEBWAVE-XXXXX) will be auto-generated
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingBottom: '32px' }}>
            <button type="button" className="btn btn-outline" onClick={() => history.back()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="create-employee-btn">
              {loading ? <><span className="spinner" /> Creating…</> : <><i className="fi fi-rr-check"></i> Create Employee</>}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
