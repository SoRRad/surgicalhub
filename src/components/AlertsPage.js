import React, { useState } from 'react';
import '../styles.css';

const SPECIALTIES = [
  'General Surgery', 'Colorectal', 'Cardiothoracic', 'Orthopedics',
  'Neurosurgery', 'Vascular', 'Transplant', 'Minimally Invasive', 'Breast Surgery',
];

const DEADLINES = [
  { value: '7', label: '7 days before' },
  { value: '14', label: '14 days before' },
  { value: '30', label: '30 days before' },
  { value: '60', label: '60 days before' },
];

// Replace YOUR_FORM_ID below with your Formspree form ID after setup
const FORMSPREE_ID = 'YOUR_FORM_ID';

export default function AlertsPage({ conferences }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedDeadline, setSelectedDeadline] = useState('14');
  const [regions, setRegions] = useState({ us: true, international: true });
  const [formats, setFormats] = useState({ 'in-person': true, virtual: true, hybrid: true });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleSpecialty(s) {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');

    const payload = {
      name,
      email,
      specialties: selectedSpecialties.length > 0 ? selectedSpecialties.join(', ') : 'All specialties',
      deadline_notice: `${selectedDeadline} days`,
      regions: Object.entries(regions).filter(([,v]) => v).map(([k]) => k).join(', '),
      formats: Object.entries(formats).filter(([,v]) => v).map(([k]) => k).join(', '),
      _subject: `SurgicalHub Alert Signup — ${email}`,
    };

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Submission failed. Please try again or contact us directly.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const upcomingDeadlines = conferences
    .filter(c => {
      const d = new Date(c.abstractClose);
      const today = new Date();
      today.setHours(0,0,0,0);
      const diff = Math.ceil((d - today) / (1000*60*60*24));
      return diff > 0 && diff <= 60;
    })
    .sort((a, b) => new Date(a.abstractClose) - new Date(b.abstractClose))
    .slice(0, 5);

  if (submitted) {
    return (
      <div className="main-content" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-bg)', borderRadius: '16px', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--navy)' }}>You're signed up!</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
            We'll send you email alerts for upcoming abstract deadlines based on your preferences.
            Check your inbox for a confirmation.
          </p>
          <button className="btn-primary" onClick={() => setSubmitted(false)}>Update preferences</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Email Alerts</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Get notified before abstract deadlines close. Customize by specialty, region, and notice period.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1rem', paddingBottom: '8px', borderBottom: '0.5px solid var(--border)' }}>
            Your Information
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Dr. Jane Smith" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address <span style={{ color: 'var(--gold)' }}>*</span></label>
              <input className="form-input" type="email" placeholder="jane@hospital.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1rem', paddingBottom: '8px', borderBottom: '0.5px solid var(--border)', marginTop: '8px' }}>
            Alert Preferences
          </div>

          {/* Specialties */}
          <div className="form-group">
            <label className="form-label">Specialties (leave blank for all)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SPECIALTIES.map(s => (
                <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                  style={{
                    padding: '5px 13px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", border: '0.5px solid',
                    borderColor: selectedSpecialties.includes(s) ? 'var(--navy)' : 'var(--border-strong)',
                    background: selectedSpecialties.includes(s) ? 'var(--navy)' : 'var(--surface)',
                    color: selectedSpecialties.includes(s) ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline notice */}
          <div className="form-group">
            <label className="form-label">Notify me this far in advance</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DEADLINES.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setSelectedDeadline(value)}
                  style={{
                    padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", border: '0.5px solid',
                    borderColor: selectedDeadline === value ? 'var(--gold)' : 'var(--border-strong)',
                    background: selectedDeadline === value ? 'var(--gold-pale)' : 'var(--surface)',
                    color: selectedDeadline === value ? 'var(--gold)' : 'var(--text-secondary)',
                    fontWeight: selectedDeadline === value ? '600' : '400',
                    transition: 'all 0.15s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="form-group">
            <label className="form-label">Regions</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[['us','United States'],['international','International']].map(([k, lbl]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={regions[k]} onChange={() => setRegions(r => ({ ...r, [k]: !r[k] }))} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="form-group">
            <label className="form-label">Formats</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[['in-person','In-Person'],['virtual','Virtual'],['hybrid','Hybrid']].map(([k, lbl]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={formats[k]} onChange={() => setFormats(f => ({ ...f, [k]: !f[k] }))} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--badge-closed-bg)', color: 'var(--badge-closed-text)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Signing up…' : '🔔 Subscribe to Alerts'}
          </button>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </form>

        {/* Sidebar — upcoming deadlines */}
        <div className="card">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '12px', paddingBottom: '8px', borderBottom: '0.5px solid var(--border)' }}>
            Upcoming deadlines (next 60 days)
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No upcoming deadlines.</p>
          ) : upcomingDeadlines.map(c => {
            const days = Math.ceil((new Date(c.abstractClose) - new Date()) / (1000*60*60*24));
            return (
              <div key={c.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--navy)', marginBottom: '3px' }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{c.org} · {c.specialty}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.abstractClose}</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: days <= 14 ? '#dc2626' : days <= 30 ? '#d97706' : '#16a34a' }}>
                    {days}d left
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
