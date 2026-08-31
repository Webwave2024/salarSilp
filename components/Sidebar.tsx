'use client';

import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  role: 'ADMIN' | 'EMPLOYEE';
  userName?: string;
  userId?: string;
}

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: <i className="fi fi-rr-chart-pie-alt"></i> },
  { href: '/admin/employees', label: 'Employees', icon: <i className="fi fi-rr-users"></i> },
  { href: '/admin/employees/new', label: 'Create Employee', icon: <i className="fi fi-rr-plus"></i> },
  { href: '/admin/payslips', label: 'Payslips', icon: <i className="fi fi-rr-document"></i> },
  { href: '/admin/payslips/generate', label: 'Generate Payslip', icon: <i className="fi fi-rr-bolt"></i> },
];

const employeeLinks = [
  { href: '/employee', label: 'Dashboard', icon: <i className="fi fi-rr-home"></i> },
  { href: '/employee/payslips', label: 'My Payslips', icon: <i className="fi fi-rr-document"></i> },
];

export default function Sidebar({ role, userName, userId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = role === 'ADMIN' ? adminLinks : employeeLinks;

  const activeLink = links
    .filter(link => pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin' && link.href !== '/employee'))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const isActive = (href: string) => activeLink?.href === href;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const initials = userName
    ? userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : role[0];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo2.jpeg" alt="WebWave Logo" style={{ width: '42px', height: '42px', borderRadius: '6px' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', lineHeight: '1.2' }}>WebWAVE</h1>
          <span style={{ fontSize: '0.7rem' }}>BUSINESS PVT. LTD. HRM</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Navigation</div>
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div className="avatar">{initials}</div>
          <div>
            <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#e2e8f0' }}>
              {userName || userId}
            </div>
            <div style={{ fontSize: '.7rem', color: '#64748b' }}>
              {role === 'ADMIN' ? <><i className="fi fi-rr-crown"></i> Administrator</> : <><i className="fi fi-rr-user"></i> Employee</>} · {userId}
            </div>
          </div>
        </div>
        <button className="sidebar-link" onClick={handleLogout} style={{ borderRadius: '6px' }}>
          <span className="icon"><i className="fi fi-rr-sign-out-alt"></i></span>
          Logout
        </button>
      </div>
    </aside>
  );
}
