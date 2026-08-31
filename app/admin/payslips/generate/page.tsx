'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { monthName, round2 } from '@/utils/salaryUtils';

interface Employee {
  id: string; full_name: string; webwave_user_id: string;
}

interface LineItem {
  field_name: string;
  amount: string; // string so the input is controlled cleanly
}

interface SummaryField {
  field_name: string; field_value: string;
}

/** Safely parse a string to a number (returns 0 on invalid) */
function safeN(val: string): number {
  const n = parseFloat(val);
  return isFinite(n) && !isNaN(n) ? Math.max(0, n) : 0;
}

function fmtINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function GeneratePayslipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmpId = searchParams.get('employee') || '';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Form
  const [employeeId, setEmployeeId] = useState(defaultEmpId);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [workingDays, setWorkingDays] = useState(26);
  const [paidDays, setPaidDays]       = useState(26);
  const [lopDays, setLopDays]         = useState(0);
  const [payDate, setPayDate]         = useState(new Date().toISOString().split('T')[0]);

  // All earnings and deductions as editable line items
  const [earnings, setEarnings]       = useState<LineItem[]>([]);
  const [deductions, setDeductions]   = useState<LineItem[]>([]);
  const [summaryFields, setSummaryFields] = useState<SummaryField[]>([]);

  useEffect(() => {
    fetch('/api/admin/employees')
      .then(r => r.json())
      .then(d => setEmployees(d.employees || []))
      .finally(() => setLoading(false));
  }, []);

  // When employee changes → fetch salary preview and pre-fill rows
  useEffect(() => {
    if (!employeeId) {
      setEarnings([]);
      setDeductions([]);
      return;
    }
    setLoadingPreview(true);
    fetch(`/api/admin/employees/${employeeId}/salary-preview`)
      .then(r => r.json())
      .then(d => {
        if (d.error || !d.preview) return;
        const p = d.preview;
        const initialEarnings = [
          { field_name: 'Basic Salary',                amount: String(p.basic) },
          { field_name: 'House Rent Allowance (HRA)', amount: String(p.hra) },
        ];

        // Add remaining amount as Personal Allowance if monthly salary > Basic + HRA
        const basicHraSum = p.basic + p.hra;
        if (d.monthly_salary > basicHraSum) {
          initialEarnings.push({
            field_name: 'Personal Allowance',
            amount: String(round2(d.monthly_salary - basicHraSum))
          });
        }

        setEarnings(initialEarnings);
        setDeductions([
          { field_name: 'Income Tax (TDS)',    amount: String(p.tds) },
          { field_name: 'Provident Fund (PF)', amount: String(p.pf) },
        ]);
      })
      .catch(() => {})
      .finally(() => setLoadingPreview(false));
  }, [employeeId]);

  // ── Line item helpers ────────────────────────────────────────

  const addEarning    = () => setEarnings(prev => [...prev, { field_name: '', amount: '0' }]);
  const removeEarning = (i: number) => setEarnings(prev => prev.filter((_, idx) => idx !== i));
  const updateEarning = (i: number, key: keyof LineItem, val: string) =>
    setEarnings(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  const addDeduction    = () => setDeductions(prev => [...prev, { field_name: '', amount: '0' }]);
  const removeDeduction = (i: number) => setDeductions(prev => prev.filter((_, idx) => idx !== i));
  const updateDeduction = (i: number, key: keyof LineItem, val: string) =>
    setDeductions(prev => prev.map((d, idx) => idx === i ? { ...d, [key]: val } : d));

  const addSummary    = () => setSummaryFields(prev => [...prev, { field_name: '', field_value: '' }]);
  const removeSummary = (i: number) => setSummaryFields(prev => prev.filter((_, idx) => idx !== i));
  const updateSummary = (i: number, key: keyof SummaryField, val: string) =>
    setSummaryFields(prev => prev.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  // ── Live calculation preview ─────────────────────────────────

  const liveCalc = useMemo(() => {
    const grossEarnings = round2(earnings.reduce((s, e) => s + safeN(e.amount), 0));
    const lopAmount = lopDays > 0 && workingDays > 0
      ? round2((grossEarnings / workingDays) * lopDays)
      : 0;
    const paidGross = round2(grossEarnings - lopAmount);
    const totalDeductions = round2(deductions.reduce((s, d) => s + safeN(d.amount), 0));
    const netSalary = round2(paidGross - totalDeductions);
    return { grossEarnings, lopAmount, paidGross, totalDeductions, netSalary };
  }, [earnings, deductions, workingDays, lopDays]);

  // ── Submit ───────────────────────────────────────────────────

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId)           { setError('Select an employee'); return; }
    if (paidDays > workingDays){ setError('Paid days cannot exceed working days'); return; }
    if (earnings.length === 0) { setError('Add at least one earning'); return; }
    if (earnings.some(e => !e.field_name.trim())) { setError('All earning names are required'); return; }
    if (deductions.some(d => !d.field_name.trim())) { setError('All deduction names are required'); return; }

    setError(''); setGenerating(true);
    try {
      const res = await fetch('/api/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id:       employeeId,
          pay_period_year:   year,
          pay_period_month:  month,
          working_days:      workingDays,
          paid_days:         paidDays,
          loss_of_pay_days:  lopDays,
          pay_date:          payDate,
          earnings:   earnings.map(e => ({ field_name: e.field_name.trim(), amount: safeN(e.amount) })),
          deductions: deductions.map(d => ({ field_name: d.field_name.trim(), amount: safeN(d.amount) })),
          summary_fields: summaryFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Generation failed'); return; }
      router.push(`/payslip/${data.payslip.id}/print`);
    } catch {
      setError('Network error');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div className="page-body"><span className="spinner dark"/></div>;

  return (
    <>
      <div className="top-header"><h2>Generate Payslip</h2></div>

      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>Generate Payslip</h1>
            <p>All earnings and deductions are fully editable. Totals update in real-time.</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span><i className="fi fi-rr-warning"></i></span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate}>

          {/* ── Employee & Period ── */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-user"></i> Employee & Period</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Employee <span className="required">*</span></label>
                <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.full_name} ({e.webwave_user_id})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Pay Date <span className="required">*</span></label>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Month</label>
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{monthName(i + 1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} min={2000} max={2100} />
              </div>
            </div>
          </div>

          {/* ── Attendance ── */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-calendar"></i> Attendance</div>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Total Working Days</label>
                <input type="number" value={workingDays} onChange={e => setWorkingDays(parseFloat(e.target.value))} min={1} max={31} step={0.5} />
              </div>
              <div className="form-group">
                <label>Paid Days</label>
                <input type="number" value={paidDays} onChange={e => setPaidDays(parseFloat(e.target.value))} min={0} max={31} step={0.5} />
              </div>
              <div className="form-group">
                <label>Loss of Pay (LOP) Days</label>
                <input type="number" value={lopDays} onChange={e => setLopDays(parseFloat(e.target.value))} min={0} max={31} step={0.5} />
              </div>
            </div>
          </div>

          {/* ── Earnings + Deductions ── */}
          {loadingPreview ? (
            <div style={{ padding: '24px', textAlign: 'center' }}><span className="spinner dark" /></div>
          ) : (
            <div className="form-grid">

              {/* EARNINGS */}
              <div className="form-section">
                <div className="form-section-title"><i className="fi fi-rr-stats"></i> Earnings</div>
                <div className="income-builder">
                  <div className="income-builder-header">
                    <div>Earning Name</div>
                    <div>Amount (₹)</div>
                    <div style={{ textAlign: 'right' }}>Action</div>
                  </div>
                  {earnings.length === 0 && (
                    <div style={{ padding: '16px 14px', fontSize: '.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Select an employee or add a row manually
                    </div>
                  )}
                  {earnings.map((e, i) => (
                    <div className="income-builder-row" key={i}>
                      <input
                        placeholder="e.g. Basic Salary"
                        value={e.field_name}
                        onChange={ev => updateEarning(i, 'field_name', ev.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={e.amount}
                        onChange={ev => updateEarning(i, 'amount', ev.target.value)}
                        min={0}
                        step={0.01}
                      />
                      <button type="button" onClick={() => removeEarning(i)} className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}>
                        <i className="fi fi-rr-cross"></i>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addEarning} className="add-field-btn">
                    + Add Earning
                  </button>
                </div>

                {/* Gross total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: '2px solid var(--border)', fontWeight: 700, fontSize: '.9rem', marginTop: '4px' }}>
                  <span>Gross Earnings</span>
                  <span>{fmtINR(liveCalc.grossEarnings)}</span>
                </div>
                {lopDays > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', fontSize: '.85rem', color: 'var(--danger)' }}>
                    <span>LOP Deduction ({lopDays} days)</span>
                    <span>- {fmtINR(liveCalc.lopAmount)}</span>
                  </div>
                )}
              </div>

              {/* DEDUCTIONS */}
              <div className="form-section">
                <div className="form-section-title"><i className="fi fi-rr-stats"></i> Deductions</div>
                <div className="income-builder">
                  <div className="income-builder-header">
                    <div>Deduction Name</div>
                    <div>Amount (₹)</div>
                    <div style={{ textAlign: 'right' }}>Action</div>
                  </div>
                  {deductions.length === 0 && (
                    <div style={{ padding: '16px 14px', fontSize: '.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No deductions added
                    </div>
                  )}
                  {deductions.map((d, i) => (
                    <div className="income-builder-row" key={i}>
                      <input
                        placeholder="e.g. Provident Fund"
                        value={d.field_name}
                        onChange={ev => updateDeduction(i, 'field_name', ev.target.value)}
                        required
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={d.amount}
                        onChange={ev => updateDeduction(i, 'amount', ev.target.value)}
                        min={0}
                        step={0.01}
                      />
                      <button type="button" onClick={() => removeDeduction(i)} className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}>
                        <i className="fi fi-rr-cross"></i>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addDeduction} className="add-field-btn">
                    + Add Deduction
                  </button>
                </div>

                {/* Total deductions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: '2px solid var(--border)', fontWeight: 700, fontSize: '.9rem', marginTop: '4px' }}>
                  <span>Total Deductions</span>
                  <span>{fmtINR(liveCalc.totalDeductions)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Net Salary Preview ── */}
          <div className="net-preview" style={{ marginBottom: '20px' }}>
            <div className="row">
              <span>Gross Earnings</span>
              <span>{fmtINR(liveCalc.grossEarnings)}</span>
            </div>
            {lopDays > 0 && (
              <div className="row">
                <span>Loss of Pay ({lopDays} days)</span>
                <span style={{ color: '#f87171' }}>- {fmtINR(liveCalc.lopAmount)}</span>
              </div>
            )}
            <div className="row">
              <span>Total Deductions</span>
              <span>- {fmtINR(liveCalc.totalDeductions)}</span>
            </div>
            <div className="row total">
              <span>Net Salary Payable</span>
              <span>{fmtINR(liveCalc.netSalary)}</span>
            </div>
            <div className="words">
              {liveCalc.netSalary >= 0 ? `= ${fmtINR(liveCalc.grossEarnings)} - ${fmtINR(liveCalc.lopAmount + liveCalc.totalDeductions)}` : ''}
            </div>
          </div>

          {/* ── Summary Fields ── */}
          <div className="form-section">
            <div className="form-section-title"><i className="fi fi-rr-document"></i> Summary / Custom Fields</div>
            <div className="income-builder">
              <div className="income-builder-header">
                <div>Field Name</div>
                <div>Value</div>
                <div style={{ textAlign: 'right' }}>Action</div>
              </div>
              {summaryFields.map((f, i) => (
                <div className="income-builder-row" key={i}>
                  <input placeholder="e.g. UAN Number" value={f.field_name} onChange={e => updateSummary(i, 'field_name', e.target.value)} required />
                  <input placeholder="e.g. 100XXXXXX" value={f.field_value} onChange={e => updateSummary(i, 'field_value', e.target.value)} required />
                  <button type="button" onClick={() => removeSummary(i)} className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}>
                    <i className="fi fi-rr-cross"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSummary} className="add-field-btn">+ Add Summary Field</button>
            </div>
          </div>

          {/* ── Submit ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={generating}>
              {generating
                ? <><span className="spinner" /> Generating...</>
                : <><i className="fi fi-rr-bolt"></i> Generate Payslip</>}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
