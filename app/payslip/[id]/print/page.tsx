'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { PayslipFull } from '@/types/payslip';
import type { CompanySettings } from '@/types/salary';

export default function PayslipPrintPage() {
  const { id } = useParams();
  const [payslip, setPayslip] = useState<PayslipFull | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/payslips/${id}`).then(r => r.json()),
      fetch('/api/company').then(r => r.json())
    ]).then(([pData, cData]) => {
      if (pData.error) throw new Error(pData.error);
      setPayslip(pData.payslip);
      setCompany(cData.company);
    }).catch(err => {
      setError(err.message || 'Failed to load payslip');
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}><span className="spinner dark" /></div>;
  if (error || !payslip) return <div style={{ padding: '40px' }}><div className="alert alert-error">{error || 'Payslip not found'}</div></div>;

  const handlePrint = () => window.print();

  const fmt = (n: number | string) =>
    '₹' + parseFloat(String(n)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', Arial, sans-serif;
          background: #e8e8e8;
          color: #1a1a1a;
          font-size: 13px;
        }

        .ps-page {
          min-height: 100vh;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ps-doc {
          width: 100%;
          max-width: 800px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }

        /* ── HEADER ── */
        .ps-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 32px 20px;
          border-bottom: 3px solid #AF9666;
        }

        .ps-logo-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ps-logo {
          width: 56px;
          height: 56px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .ps-company-name {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .ps-company-addr {
          font-size: 11px;
          color: #555;
          margin-top: 4px;
          line-height: 1.6;
        }

        .ps-period-box {
          text-align: right;
        }

        .ps-slip-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .ps-slip-month {
          font-size: 13px;
          font-weight: 500;
          color: #444;
          margin-top: 4px;
        }

        /* ── DIVIDER LABEL ── */
        .ps-section-label {
          background: #AF9666;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 5px 32px;
        }

        /* ── EMPLOYEE DETAILS ── */
        .ps-emp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 24px 32px;
          gap: 20px 40px;
          border-bottom: 1px solid #ddd;
          background: #fdfdfd;
        }

        .ps-emp-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ps-emp-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #888;
        }

        .ps-emp-value {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          text-transform: capitalize;
        }

        .ps-emp-value.mono {
          font-family: 'Courier New', monospace;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── INCOME TABLE ── */
        .ps-income-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #ddd;
        }

        .ps-income-col {
          border-right: 1px solid #ddd;
        }
        .ps-income-col:last-child { border-right: none; }

        .ps-income-head {
          display: grid;
          grid-template-columns: 1fr auto;
          padding: 12px 24px;
          background: #fafafa;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #888;
          border-bottom: 1px solid #eee;
        }

        .ps-income-row {
          display: grid;
          grid-template-columns: 1fr auto;
          padding: 10px 24px;
          font-size: 13px;
          color: #333;
          border-bottom: 1px solid #f9f9f9;
          min-height: 40px;
          align-items: center;
        }

        .ps-income-row:last-child { border-bottom: none; }

        .ps-income-total {
          display: grid;
          grid-template-columns: 1fr auto;
          padding: 14px 24px;
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          background: #fafafa;
          border-top: 1px solid #eee;
        }

        /* ── NET PAYABLE ── */
        .ps-net-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 32px;
          border-top: 1px solid #eee;
          border-bottom: 3px solid #AF9666;
          background: #faf8f4;
        }

        .ps-net-left {}

        .ps-net-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #888;
        }

        .ps-net-words {
          font-size: 11px;
          color: #555;
          margin-top: 3px;
          font-style: italic;
        }

        .ps-net-amount {
          font-size: 22px;
          font-weight: 700;
          color: #AF9666;
        }

        /* ── FOOTER ── */
        .ps-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 16px 32px 24px;
        }

        .ps-footer-note {
          font-size: 10px;
          color: #999;
          font-style: italic;
        }

        .ps-sig-box {
          text-align: center;
        }

        .ps-sig-line {
          width: 140px;
          border-top: 1px solid #888;
          margin-bottom: 4px;
        }

        .ps-sig-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── ACTIONS ── */
        .ps-actions {
          margin-top: 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .ps-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 22px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.15s;
        }

        .ps-btn-primary {
          background: #1a1a1a;
          color: #fff;
        }
        .ps-btn-primary:hover { background: #333; }

        .ps-btn-outline {
          background: #fff;
          color: #444;
          border: 1.5px solid #ccc;
        }
        .ps-btn-outline:hover { background: #f5f5f5; }

        /* ── PRINT ── */
        @media print {
          body { background: #fff; }
          .ps-actions { display: none !important; }
          .ps-page { padding: 0; background: #fff; }
          .ps-doc { box-shadow: none; max-width: 100%; }
          @page { margin: 12mm; size: A4; }
        }
      `}</style>

      <div className="ps-page">
        <div className="ps-doc">

          {/* HEADER */}
          <div className="ps-header">
            <div className="ps-logo-row">
              <img src="/logo2.jpeg" alt="Logo" className="ps-logo" />
              <div>
                <div className="ps-company-name">{company?.company_name || 'WebWave Business Pvt. Ltd.'}</div>
                <div className="ps-company-addr">
                  {company?.address || 'Tilak Nagar, Mall Road'} <br />
                  {company?.city || 'New Delhi'}, {company?.state || 'Delhi'} – {company?.pincode || '110018'}<br />
                </div>
              </div>
            </div>
            <div className="ps-period-box">
              <div className="ps-slip-title">Pay Slip</div>
              <div className="ps-slip-month">{payslip.pay_period}</div>
            </div>
          </div>

          {/* EMPLOYEE DETAILS */}
          <div className="ps-section-label">Employee Details</div>
          <div className="ps-emp-grid">
            <div className="ps-emp-item">
              <div className="ps-emp-label">Employee Name</div>
              <div className="ps-emp-value">{payslip.employee_name}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Employee ID</div>
              <div className="ps-emp-value mono">{payslip.employee_user_id}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Department</div>
              <div className="ps-emp-value">{payslip.department || '—'}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Designation</div>
              <div className="ps-emp-value">{payslip.designation || '—'}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Joining Date</div>
              <div className="ps-emp-value">
                {payslip.joining_date ? new Date(payslip.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Working Days</div>
              <div className="ps-emp-value">{payslip.working_days}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Paid Days</div>
              <div className="ps-emp-value">{payslip.paid_days}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Loss of Pay Days</div>
              <div className="ps-emp-value">{payslip.loss_of_pay_days}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Pending Leave Days</div>
              <div className="ps-emp-value">{payslip.pending_leave_days}</div>
            </div>
            <div className="ps-emp-item">
              <div className="ps-emp-label">Pay Date</div>
              <div className="ps-emp-value">
                {new Date(payslip.pay_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
            {payslip.summary_fields.map(f => (
              <div className="ps-emp-item" key={f.id}>
                <div className="ps-emp-label">{f.field_name}</div>
                <div className="ps-emp-value">{f.field_value}</div>
              </div>
            ))}
          </div>

          {/* INCOME TABLE */}
          <div className="ps-section-label">Income Details</div>
          <div className="ps-income-grid">
            {/* EARNINGS */}
            <div className="ps-income-col">
              <div className="ps-income-head">
                <span>Earnings</span>
                <span>Amount</span>
              </div>
              {payslip.earnings.map(e => (
                <div className="ps-income-row" key={e.id}>
                  <span>{e.field_name}</span>
                  <span>{fmt(e.amount)}</span>
                </div>
              ))}
              <div className="ps-income-total">
                <span>Gross Earnings</span>
                <span>{fmt(payslip.gross_earnings)}</span>
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div className="ps-income-col">
              <div className="ps-income-head">
                <span>Deductions</span>
                <span>Amount</span>
              </div>
              {payslip.deductions.map(d => (
                <div className="ps-income-row" key={d.id}>
                  <span>{d.field_name}</span>
                  <span>{fmt(d.amount)}</span>
                </div>
              ))}
              <div className="ps-income-total">
                <span>Total Deductions</span>
                <span>{fmt(payslip.total_deductions)}</span>
              </div>
            </div>
          </div>

          {/* NET PAYABLE */}
          <div className="ps-net-box">
            <div className="ps-net-left">
              <div className="ps-net-title">Net Salary Payable</div>
              <div className="ps-net-words">In Words: {payslip.amount_in_words}</div>
            </div>
            <div className="ps-net-amount">{fmt(payslip.net_payable)}</div>
          </div>

          {/* FOOTER */}
          <div className="ps-footer">
            <div className="ps-footer-note">
              This is a computer-generated document.<br />No physical signature is required.
            </div>
            <div className="ps-sig-box">
              <div className="ps-sig-line" />
              <div className="ps-sig-label">Authorised Signatory</div>
            </div>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="ps-actions">
          <button onClick={() => window.close()} className="ps-btn ps-btn-outline">
            Close
          </button>
          <button onClick={handlePrint} className="ps-btn ps-btn-primary">
            <i className="fi fi-rr-print"></i> Print / Download PDF
          </button>
        </div>
      </div>
    </>
  );
}
