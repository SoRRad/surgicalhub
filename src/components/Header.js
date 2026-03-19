import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  header: {
    background: '#0B1E3D',
    borderBottom: '2px solid #C9922A',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: {
    width: '32px', height: '32px', background: '#C9922A',
    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#fff' },
  nav: { display: 'flex', alignItems: 'center', gap: '4px' },
  navLink: {
    color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
    fontSize: '14px', padding: '6px 14px', borderRadius: '6px', transition: 'all 0.15s',
  },
  navLinkActive: {
    color: '#fff', background: 'rgba(255,255,255,0.1)',
  },
  submitBtn: {
    background: '#C9922A', color: '#0B1E3D', border: 'none',
    padding: '8px 18px', borderRadius: '6px', fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginLeft: '8px',
  },
};

const navLinks = [
  { to: '/', label: 'Directory' },
  { to: '/search', label: 'Abstract Search' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/alerts', label: 'Email Alerts' },
  { to: '/admin', label: 'Admin' },
];

export default function Header({ onSubmit }) {
  const location = useLocation();

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>
        <div style={styles.logoMark}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0B1E3D">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
        <span style={styles.logoText}>
          Surgical<span style={{ color: '#E6B44A' }}>Hub</span>
        </span>
      </Link>

      <nav style={styles.nav}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              ...styles.navLink,
              ...(location.pathname === to ? styles.navLinkActive : {}),
            }}
          >
            {label}
          </Link>
        ))}
        <button style={styles.submitBtn} onClick={onSubmit}>
          + Submit Conference
        </button>
      </nav>
    </header>
  );
}
