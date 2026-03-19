import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDeadlineStatus, formatDate, daysUntil, statusLabel } from '../utils';
import '../styles.css';

export default function ConferenceDetail({ conferences }) {
  const { id } = useParams();
  const conf = conferences.find(c => String(c.id) === String(id));

  if (!conf) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Conference not found</h2>
        <Link to="/" style={{ color: 'var(--gold)' }}>← Back to directory</Link>
      </div>
    );
  }

  const status = getDeadlineStatus(conf.abstractOpen, conf.abstractClose);
  const days = daysUntil(conf.abstractClose);
  const mapsQuery = conf.venueAddress
    ? encodeURIComponent(conf.venueAddress)
    : encodeURIComponent(conf.venue + ' ' + conf.city);

  return (
    <div className="main-content" style={{ maxWidth: '1000px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Directory</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span>{conf.name}</span>
      </div>

      {/* Hero */}
      <div style={{ background: 'var(--navy)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gold)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="badge-specialty">{conf.specialty}</span>
              <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
              {conf.featured && (
                <span style={{ background: 'rgba(201,146,42,0.2)', color: '#E6B44A', border: '0.5px solid rgba(201,146,42,0.4)', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' }}>
                  ★ Featured
                </span>
              )}
            </div>
            <h1 style={{ color: '#fff', fontSize: '26px', lineHeight: '1.2', marginBottom: '6px', maxWidth: '620px' }}>{conf.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{conf.org}</p>
          </div>
          <a href={conf.website} target="_blank" rel="noreferrer"
            style={{ background: 'var(--gold)', color: 'var(--navy)', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
            Visit Official Site →
          </a>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Conference Dates */}
        <InfoCard title="📅 Conference Dates">
          <DetailRow label="Start">{formatDate(conf.confStart)}</DetailRow>
          <DetailRow label="End">{formatDate(conf.confEnd)}</DetailRow>
          <DetailRow label="Format">
            <span style={{ textTransform: 'capitalize' }}>{conf.format}</span>
          </DetailRow>
          <DetailRow label="Region">{conf.region === 'us' ? 'United States' : 'International'}</DetailRow>
        </InfoCard>

        {/* Abstract Submission */}
        <InfoCard title="📝 Abstract Submission">
          <DetailRow label="Opens">{formatDate(conf.abstractOpen)}</DetailRow>
          <DetailRow label="Deadline">
            <span style={{ color: status === 'open' ? '#16a34a' : status === 'closed' ? '#dc2626' : '#d97706', fontWeight: '600' }}>
              {formatDate(conf.abstractClose)}
            </span>
          </DetailRow>
          <DetailRow label="Status">
            <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
          </DetailRow>
          {days > 0 && status !== 'upcoming' && (
            <DetailRow label="Time left">
              <span style={{ fontWeight: '600', color: days <= 30 ? '#d97706' : 'var(--navy)' }}>{days} days</span>
            </DetailRow>
          )}
        </InfoCard>
      </div>

      {/* CME + Sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <InfoCard title="🎓 CME Credits">
          {conf.cme ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '48px', fontFamily: "'DM Serif Display', serif", color: 'var(--gold)', lineHeight: 1 }}>{conf.cme}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>AMA PRA Category 1 Credits™</div>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>CME credit information not available.</p>
          )}
          {conf.tags && conf.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '0.5px solid var(--border)' }}>
              {conf.tags.map(tag => (
                <span key={tag} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'var(--surface)', color: 'var(--text-secondary)', border: '0.5px solid var(--border-strong)' }}>{tag}</span>
              ))}
            </div>
          )}
        </InfoCard>

        <InfoCard title="🗓 Sessions & Tracks">
          {conf.sessions && conf.sessions.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conf.sessions.map(s => (
                <li key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Session information not yet available.</p>
          )}
        </InfoCard>
      </div>

      {/* Venue + Map */}
      <InfoCard title="📍 Venue & Location" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
          <div>
            <p style={{ fontWeight: '500', fontSize: '15px', color: 'var(--navy)', marginBottom: '4px' }}>{conf.venue}</p>
            {conf.venueAddress && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{conf.venueAddress}</p>
            )}
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {conf.city}, {conf.country}
            </p>
            {conf.format !== 'virtual' && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', background: 'var(--navy)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>
                Open in Google Maps →
              </a>
            )}
          </div>
          {conf.format !== 'virtual' && (
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '0.5px solid var(--border)', height: '200px' }}>
              <iframe
                title="Venue map"
                width="100%"
                height="200"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
              />
            </div>
          )}
        </div>
      </InfoCard>

      {/* Notes */}
      {conf.notes && (
        <InfoCard title="ℹ️ Additional Information" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{conf.notes}</p>
        </InfoCard>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--gold)', fontSize: '14px', textDecoration: 'none' }}>← Back to directory</Link>
      </div>
    </div>
  );
}

function InfoCard({ title, children, style }) {
  return (
    <div className="card" style={style}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '14px', paddingBottom: '10px', borderBottom: '0.5px solid var(--border)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '8px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: '500', textAlign: 'right' }}>{children}</span>
    </div>
  );
}
