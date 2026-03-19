import React, { useState } from 'react';
import '../styles.css';

const SPECIALTIES = [
  'General Surgery', 'Colorectal', 'Cardiothoracic', 'Orthopedics',
  'Neurosurgery', 'Vascular', 'Transplant', 'Minimally Invasive',
  'Breast Surgery', 'Multi-specialty',
];

const empty = {
  name: '', org: '', specialty: '', confStart: '', confEnd: '',
  city: '', country: '', region: 'us', format: 'in-person',
  abstractOpen: '', abstractClose: '', website: '', cme: '', notes: '',
  venue: '', venueAddress: '', sessions: '', tags: '',
};

export default function SubmitModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(empty);
  const [submitted, setSubmitted] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    const conf = {
      ...form,
      cme: form.cme ? Number(form.cme) : null,
      sessions: form.sessions ? form.sessions.split('\n').filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    onSubmit(conf);
    setSubmitted(true);
    setTimeout(() => { onClose(); }, 2200);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(11,30,61,0.5)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--card-bg)', borderRadius: '16px', width: '100%', maxWidth: '620px',
        maxHeight: '90vh', overflowY: 'auto', border: '0.5px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '1.25rem 1.5rem', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontFamily: "'DM Serif Display', serif" }}>Submit a Conference</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>Submitted conferences are reviewed by our team before publishing.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {submitted ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '8px' }}>Submitted for review!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Our team will review your submission and publish it within 2–3 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            <SectionLabel>Conference Information</SectionLabel>

            <div className="form-group">
              <label className="form-label">Conference Name <Req /></label>
              <input className="form-input" required placeholder="e.g., American College of Surgeons Annual Congress" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Organizing Society <Req /></label>
                <input className="form-input" required placeholder="e.g., ACS" value={form.org} onChange={e => set('org', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Specialty <Req /></label>
                <select className="form-select" required value={form.specialty} onChange={e => set('specialty', e.target.value)}>
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date <Req /></label>
                <input className="form-input" type="date" required value={form.confStart} onChange={e => set('confStart', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.confEnd} onChange={e => set('confEnd', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g., Chicago" value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Country <Req /></label>
                <input className="form-input" required placeholder="e.g., USA" value={form.country} onChange={e => set('country', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Region <Req /></label>
                <select className="form-select" value={form.region} onChange={e => set('region', e.target.value)}>
                  <option value="us">United States</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Format <Req /></label>
                <select className="form-select" value={form.format} onChange={e => set('format', e.target.value)}>
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <SectionLabel>Venue</SectionLabel>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Venue Name</label>
                <input className="form-input" placeholder="e.g., McCormick Place" value={form.venue} onChange={e => set('venue', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Venue Address</label>
                <input className="form-input" placeholder="Full street address" value={form.venueAddress} onChange={e => set('venueAddress', e.target.value)} />
              </div>
            </div>

            <SectionLabel>Abstract Submission</SectionLabel>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Submission Opens</label>
                <input className="form-input" type="date" value={form.abstractOpen} onChange={e => set('abstractOpen', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Submission Deadline</label>
                <input className="form-input" type="date" value={form.abstractClose} onChange={e => set('abstractClose', e.target.value)} />
              </div>
            </div>

            <SectionLabel>Additional Details</SectionLabel>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CME Credits</label>
                <input className="form-input" type="number" placeholder="e.g., 20" value={form.cme} onChange={e => set('cme', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Conference Website</label>
                <input className="form-input" type="url" placeholder="https://…" value={form.website} onChange={e => set('website', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sessions / Tracks (one per line)</label>
              <textarea className="form-textarea" placeholder={"Keynote Lectures\nHands-on Skills Labs\nResident Competition"} value={form.sessions} onChange={e => set('sessions', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input className="form-input" placeholder="e.g., Robotic Surgery, CME, Residents" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Any additional information, eligibility requirements, awards, etc." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '0.5px solid var(--border)' }}>
              <button type="button" className="btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>Submit for Review →</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Req() {
  return <span style={{ color: 'var(--gold)' }}>*</span>;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: '600', color: 'var(--text-muted)', margin: '1rem 0 0.8rem', paddingBottom: '6px', borderBottom: '0.5px solid var(--border)' }}>
      {children}
    </div>
  );
}
