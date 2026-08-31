'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid User ID or Password');
        return;
      }

      if (data.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/employee');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo2.jpeg" alt="WebWave Logo" style={{ width: '42px', height: '42px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <h1>WebWave Business Pvt. Ltd.</h1>
          <p>Employee Payslip Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              <span><i className="fi fi-rr-warning"></i></span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="userId">
              User ID <span className="required">*</span>
            </label>
            <input
              id="userId"
              type="text"
              placeholder="WEBWAVE-28282"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            id="login-btn"
          >
            {loading ? <><span className="spinner" /> Signing in…</> : '→  Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '24px' }}>
          Secure HR Portal · WebWave Technologies
        </p>
      </div>
    </div>
  );
}
