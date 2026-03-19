import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDeadlineStatus, formatDate, daysUntil, statusLabel } from '../utils';
import '../styles.css';

const SPECIALTIES = [
  'All', 'General Surgery', 'Colorectal', 'Cardiothoracic',
  'Orthopedics', 'Neurosurgery', 'Vascular', 'Transplant',
  'Minimally Invasive', 'Breast Surgery',
];

export default function Directory({ conferences }) {
  const [search, setSearch] = useState('');
  const [deadline, setDeadline] = useState('all');
  const [location, setLocation] = useState('all');
  const [format, setFormat] = useState('all');
  const [specialty, setSpecialty] = useState('All');
  const [sort, setSort] = useState('date-asc');
  const [view, setView] = useState('grid');

  const filtered = useMemo(() => {
    let res = conferences.filter(c => {
      const status = getDeadlineStatus(c.abstractOpen, c.abstractClose);
      if (deadline !== 'all' && status !== deadline) return false;
      if (location !== 'all' && c.region !== location) return false;
      if (format !== 'all' && c.format !== format) return false;
      if (specialty !== 'All' && c.specialty !== specialty) return false;
      if (search) {
        const hay = (c.name + c.org + c.city + c.country + c.specialty + c.notes).toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
    res.sort((a, b) => {
      if (sort === 'date-asc') return new Date(a.confStart) - new Date(b.confStart);
      if (sort === 'date-desc') return new Date(b.confStart) - new Date(a.confStart);
      if (sort === 'deadline-asc') return new Date(a.abstractClose) - new Date(b.abstractClose);
      if (sort === 'alpha') return a.name.localeCompare(b.name);
      return 0;
    });
    return res;
  }, [conferences, search, deadline, location, format, specialty, sort]);

  const openCount = conferences.filter(c => getDeadlineStatus(c.abstractOpen, c.abstractClose) === 'open').length;
  const soonCount = conferences.filter(c => getDeadlineStatus(c.abstractOpen, c.abstractClose) === 'soon').length;

  return (
    <div className="main-content">
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Surgery Conference Directory</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Browse upcoming surgical meetings, abstract deadlines, and submission windows across all specialties.
      </p>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { dot: '#16a34a', label: 'abstracts open', count: openCount },
          { dot: '#d97706', label: 'closing soon', count: soonCount },
          { dot: '#0B1E3D', label: 'total conferences', count: conferences.length },
        ].map(({ dot, label, count }) => (
          <div key={label} className="card" style={{ padding: '6px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, display: 'inline-block' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--navy)' }}>{count}</strong> {label}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="form-input"
              style={{ paddingLeft: '34px' }}
              placeholder="Search conferences, specialties, locations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select" style={{ minWidth: '200px' }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="date-asc">Sort: Date (earliest first)</option>
            <option value="date-desc">Sort: Date (latest first)</option>
            <option value="deadline-asc">Sort: Deadline (soonest)</option>
            <option value="alpha">Sort: A–Z</option>
          </select>
        </div>

        {/* Chip filters */}
        <FilterRow label="Deadline" options={[['all','All'],['open','Open'],['soon','Closing Soon'],['closed','Closed']]} value={deadline} onChange={setDeadline} />
        <FilterRow label="Location" options={[['all','All'],['us','US'],['international','International']]} value={location} onChange={setLocation} />
        <FilterRow label="Format" options={[['all','All'],['in-person','In-Person'],['virtual','Virtual'],['hybrid','Hybrid']]} value={format} onChange={setFormat} />

        {/* Specialty chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '0.5px solid var(--border)', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginRight: '4px' }}>Specialty:</span>
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => setSpecialty(s)}
              style={{
                padding: '5px 13px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", border: '0.5px solid',
                borderColor: specialty === s ? 'var(--navy)' : 'var(--border-strong)',
                background: specialty === s ? 'var(--navy)' : 'var(--surface)',
                color: specialty === s ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--navy)' }}>{filtered.length}</strong> of {conferences.length} conferences
        </span>
        <div style={{ display: 'flex', border: '0.5px solid var(--border-strong)', borderRadius: '8px', overflow: 'hidden', background: 'var(--card-bg)' }}>
          {[['grid', '⊞'], ['list', '≡']].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)}
              style={{
                padding: '7px 14px', border: 'none', fontSize: '16px', cursor: 'pointer',
                background: view === v ? 'var(--navy)' : 'transparent',
                color: view === v ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔬</div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '6px' }}>No conferences match your filters</h3>
          <p style={{ fontSize: '13px' }}>Try adjusting your search or filter criteria.</p>
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map(c => <ConferenceCard key={c.id} conf={c} />)}
        </div>
      ) : (
        <ListView conferences={filtered} />
      )}
    </div>
  );
}

function FilterRow({ label, options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '0.5px solid var(--border)' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginRight: '4px' }}>{label}:</span>
      {options.map(([val, lbl]) => (
        <button key={val} onClick={() => onChange(val)}
          style={{
            padding: '5px 13px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", border: '0.5px solid',
            borderColor: value === val ? 'var(--navy)' : 'var(--border-strong)',
            background: value === val ? 'var(--navy)' : 'var(--surface)',
            color: value === val ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}>
          {lbl}
        </button>
      ))}
    </div>
  );
}

function ConferenceCard({ conf: c }) {
  const status = getDeadlineStatus(c.abstractOpen, c.abstractClose);
  const days = daysUntil(c.abstractClose);
  const daysText = days > 0 ? `${days}d left` : `${Math.abs(days)}d ago`;

  return (
    <Link to={`/conference/${c.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s', position: 'relative', overflow: 'hidden' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gold)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', marginTop: '8px' }}>
          <span className="badge-specialty">{c.specialty}</span>
          <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
        </div>

        <h3 style={{ fontSize: '15px', fontFamily: "'DM Serif Display', serif", color: 'var(--navy)', marginBottom: '3px', lineHeight: '1.3' }}>{c.name}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{c.org}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
          <MetaRow icon="📅">{formatDate(c.confStart)} – {formatDate(c.confEnd)}</MetaRow>
          <MetaRow icon="📍">{c.city}, {c.country}</MetaRow>
          {c.cme && <MetaRow icon="🎓">{c.cme} CME credits</MetaRow>}
        </div>

        <div style={{ height: '0.5px', background: 'var(--border)', margin: '12px 0' }} />

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>Abstract Submission</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Opens</span>
            <span style={{ fontWeight: '500' }}>{formatDate(c.abstractOpen)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Deadline</span>
            <span style={{ fontWeight: '500', color: status === 'open' ? '#16a34a' : status === 'closed' ? '#dc2626' : '#d97706' }}>
              {formatDate(c.abstractClose)} · {daysText}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <TypePill type={c.region === 'us' ? 'us' : 'intl'}>{c.region === 'us' ? 'US' : 'International'}</TypePill>
            <TypePill type={c.format}>{c.format.charAt(0).toUpperCase() + c.format.slice(1)}</TypePill>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '500' }}>View details →</span>
        </div>
      </div>
    </Link>
  );
}

function MetaRow({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
      <span style={{ fontSize: '13px' }}>{icon}</span>{children}
    </div>
  );
}

function TypePill({ type, children }) {
  const colors = {
    us: { color: '#0f766e', bg: '#f0fdfa', border: 'rgba(15,118,110,0.3)' },
    intl: { color: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.3)' },
    virtual: { color: '#7c3aed', bg: '#f5f3ff', border: 'rgba(124,58,237,0.3)' },
    hybrid: { color: '#c2410c', bg: '#fff7ed', border: 'rgba(194,65,12,0.3)' },
    'in-person': { color: 'var(--text-secondary)', bg: 'var(--surface)', border: 'var(--border-strong)' },
  };
  const s = colors[type] || colors['in-person'];
  return (
    <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '20px', border: `0.5px solid ${s.border}`, background: s.bg, color: s.color }}>
      {children}
    </span>
  );
}

function ListView({ conferences }) {
  const cols = ['Conference', 'Specialty', 'Dates', 'Location', 'Abstract Deadline', 'Status'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.3fr 1.2fr 1.3fr 0.9fr',
        gap: '12px', padding: '10px 1.25rem',
        background: 'var(--navy)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)',
        fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.7px',
      }}>
        {cols.map(c => <div key={c}>{c}</div>)}
      </div>
      {conferences.map(c => {
        const status = getDeadlineStatus(c.abstractOpen, c.abstractClose);
        return (
          <Link key={c.id} to={`/conference/${c.id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.3fr 1.2fr 1.3fr 0.9fr',
              gap: '12px', padding: '12px 1.25rem', alignItems: 'center', borderRadius: '10px',
              transition: 'border-color 0.15s', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div>
                <div style={{ fontWeight: '500', fontSize: '13px', color: 'var(--navy)' }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.org}</div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.specialty}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(c.confStart)}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.city}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(c.abstractClose)}</div>
              <div><span className={`badge badge-${status}`}>{statusLabel(status)}</span></div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
