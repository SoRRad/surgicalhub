import React from 'react';
import { formatDate, getDeadlineStatus, statusLabel } from '../utils';
import '../styles.css';

export default function AdminPanel({ pending, onApprove, onReject }) {
  const queued = pending.filter(c => c.status === 'pending');
  const approved = pending.filter(c => c.status === 'approved');
  const rejected = pending.filter(c => c.status === 'rejected');

  return (
    <div className="main-content" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <div style={{ background: 'var(--navy)', borderRadius: '8px', padding: '6px 12px' }}>
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>ADMIN</span>
        </div>
        <h1 style={{ fontSize: '28px' }}>Conference Submissions</h1>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Review and approve community-submitted conferences before they appear in the public directory.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending Review', count: queued.length, color: '#d97706', bg: 'var(--badge-soon-bg)' },
          { label: 'Approved', count: approved.length, color: '#16a34a', bg: 'var(--badge-open-bg)' },
          { label: 'Rejected', count: rejected.length, color: '#dc2626', bg: 'var(--badge-closed-bg)' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{ background: bg, border: `0.5px solid ${color}30`, borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontFamily: "'DM Serif Display', serif", color, lineHeight: 1 }}>{count}</div>
            <div style={{ fontSize: '12px', color, fontWeight: '600', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Pending queue */}
      <Section title="Pending Review" count={queued.length}>
        {queued.length === 0 ? (
          <Empty message="No submissions pending review. Check back later." />
        ) : queued.map(c => (
          <SubmissionCard key={c.id} conf={c} onApprove={onApprove} onReject={onReject} showActions />
        ))}
      </Section>

      <Section title="Approved" count={approved.length}>
        {approved.length === 0 ? (
          <Empty message="No approved submissions yet." />
        ) : approved.map(c => (
          <SubmissionCard key={c.id} conf={c} status="approved" />
        ))}
      </Section>

      <Section title="Rejected" count={rejected.length}>
        {rejected.length === 0 ? (
          <Empty message="No rejected submissions." />
        ) : rejected.map(c => (
          <SubmissionCard key={c.id} conf={c} status="rejected" />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--navy)' }}>{title}</h2>
        <span style={{ background: 'var(--surface)', border: '0.5px solid var(--border-strong)', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>{count}</span>
      </div>
      {children}
    </div>
  );
}

function SubmissionCard({ conf: c, onApprove, onReject, showActions, status }) {
  return (
    <div className="card" style={{
      marginBottom: '10px',
      borderLeft: `4px solid ${status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#d97706'}`,
      borderRadius: '0 12px 12px 0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="badge-specialty">{c.specialty || 'Unknown'}</span>
            {c.region && (
              <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: 'var(--surface)', border: '0.5px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                {c.region === 'us' ? 'US' : 'International'}
              </span>
            )}
            {c.format && (
              <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: 'var(--surface)', border: '0.5px solid var(--border-strong)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {c.format}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '15px', fontFamily: "'DM Serif Display', serif", color: 'var(--navy)', marginBottom: '3px' }}>{c.name}</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{c.org}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            <InfoItem label="Conference dates" value={c.confStart ? `${formatDate(c.confStart)} – ${formatDate(c.confEnd)}` : '—'} />
            <InfoItem label="Location" value={c.city ? `${c.city}, ${c.country}` : '—'} />
            <InfoItem label="Abstract opens" value={c.abstractOpen ? formatDate(c.abstractOpen) : '—'} />
            <InfoItem label="Abstract deadline" value={c.abstractClose ? formatDate(c.abstractClose) : '—'} />
            {c.website && <InfoItem label="Website" value={<a href={c.website} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>{c.website}</a>} />}
          </div>

          {c.notes && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', padding: '8px', background: 'var(--surface)', borderRadius: '6px' }}>
              {c.notes}
            </p>
          )}
        </div>

        {showActions && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => onReject(c.id)}
              style={{ padding: '8px 18px', background: 'var(--badge-closed-bg)', color: 'var(--badge-closed-text)', border: `0.5px solid ${('var(--badge-closed-text)')}30`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
              ✕ Reject
            </button>
            <button onClick={() => onApprove(c.id)}
              style={{ padding: '8px 18px', background: 'var(--badge-open-bg)', color: 'var(--badge-open-text)', border: '0.5px solid rgba(22,163,74,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
              ✓ Approve
            </button>
          </div>
        )}

        {status && !showActions && (
          <div>
            <span className={`badge badge-${status === 'approved' ? 'open' : 'closed'}`}>
              {status === 'approved' ? '✓ Approved' : '✕ Rejected'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{value}</div>
    </div>
  );
}

function Empty({ message }) {
  return (
    <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
      {message}
    </div>
  );
}
