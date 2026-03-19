import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SPECIALTIES, US_STATES } from '../utils';

const CA_PROVINCES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

const EMPTY = {
  name: '', org: '', spec: '', start: '', end: '', city: '',
  locationRegion: 'us', state: '', country: 'USA',
  fmt: 'in-person', aOpen: '', aClose: '', cme: '', website: '', notes: '', tags: '',
};

export default function AddConferencePage({ onAdd }) {
  const nav = useNavigate();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  function set(k, v) {
    setF(prev => {
      const next = { ...prev, [k]: v };
      // auto-set country based on region
      if (k === 'locationRegion') {
        if (v === 'us') next.country = 'USA';
        else if (v === 'canada') next.country = 'Canada';
        else next.country = '';
        next.state = '';
      }
      return next;
    });
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  }

  function validate() {
    const e = {};
    if (!f.name.trim())  e.name  = 'Conference name is required';
    if (!f.org.trim())   e.org   = 'Organization is required';
    if (!f.spec)         e.spec  = 'Specialty is required';
    if (!f.start)        e.start = 'Start date is required';
    if (!f.end)          e.end   = 'End date is required';
    if (!f.city.trim())  e.city  = 'City is required';
    if (f.locationRegion === 'us' && !f.state) e.state = 'State is required';
    if (f.locationRegion === 'canada' && !f.state) e.state = 'Province is required';
    if (f.locationRegion === 'international' && !f.country.trim()) e.country = 'Country is required';
    return e;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const conf = {
      name:    f.name.trim(),
      org:     f.org.trim(),
      spec:    f.spec,
      start:   f.start,
      end:     f.end,
      city:    f.city.trim(),
      state:   (f.locationRegion === 'us' || f.locationRegion === 'canada') ? f.state : null,
      country: f.locationRegion === 'us' ? 'USA' : f.locationRegion === 'canada' ? 'Canada' : f.country.trim(),
      region:  f.locationRegion === 'us' ? 'us' : 'international',
      fmt:     f.fmt,
      aOpen:   f.aOpen || null,
      aClose:  f.aClose || null,
      cme:     f.cme ? Number(f.cme) : null,
      website: f.website.trim() || null,
      notes:   f.notes.trim() || null,
      tags:    f.tags ? f.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    onAdd(conf);
    setSaved(true);
    setTimeout(() => { setSaved(false); setF(EMPTY); }, 2000);
  }

  const stateOpts = f.locationRegion === 'canada' ? CA_PROVINCES : US_STATES;
  const showState = f.locationRegion === 'us' || f.locationRegion === 'canada';

  return (
    <div style={{ padding: '1.5rem', maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{ background: 'var(--navy)', color: 'var(--gold)', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px' }}>ADMIN</div>
        <h2 style={{ fontSize: '22px' }}>Add conference directly</h2>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--txt2)', marginBottom: '1.5rem' }}>
        Conferences added here are approved immediately and appear in the directory.&nbsp;
        <Link to="/admin" style={{ color: 'var(--gold)' }}>← Back to Admin</Link>
      </p>

      <form className="card" onSubmit={handleSave}>

        {/* ── Basic info ── */}
        <div className="section-label">Conference information</div>

        <div className="form-group">
          <label className="form-label">Conference name <span style={{color:'var(--gold)'}}>*</span></label>
          <input className="form-input" value={f.name} onChange={e=>set('name',e.target.value)} placeholder="Full official conference name" />
          {errors.name && <Err>{errors.name}</Err>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Organization / society <span style={{color:'var(--gold)'}}>*</span></label>
            <input className="form-input" value={f.org} onChange={e=>set('org',e.target.value)} placeholder="e.g. ACS, SAGES, SVS" />
            {errors.org && <Err>{errors.org}</Err>}
          </div>
          <div className="form-group">
            <label className="form-label">Specialty <span style={{color:'var(--gold)'}}>*</span></label>
            <select className="form-select" value={f.spec} onChange={e=>set('spec',e.target.value)}>
              <option value="">Select specialty…</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.spec && <Err>{errors.spec}</Err>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start date <span style={{color:'var(--gold)'}}>*</span></label>
            <input className="form-input" type="date" value={f.start} onChange={e=>set('start',e.target.value)} />
            {errors.start && <Err>{errors.start}</Err>}
          </div>
          <div className="form-group">
            <label className="form-label">End date <span style={{color:'var(--gold)'}}>*</span></label>
            <input className="form-input" type="date" value={f.end} onChange={e=>set('end',e.target.value)} />
            {errors.end && <Err>{errors.end}</Err>}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="section-label">Location</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Region <span style={{color:'var(--gold)'}}>*</span></label>
            <select className="form-select" value={f.locationRegion} onChange={e=>set('locationRegion',e.target.value)}>
              <option value="us">United States</option>
              <option value="canada">Canada</option>
              <option value="international">Other international</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">City <span style={{color:'var(--gold)'}}>*</span></label>
            <input className="form-input" value={f.city} onChange={e=>set('city',e.target.value)} placeholder="e.g. Chicago" />
            {errors.city && <Err>{errors.city}</Err>}
          </div>
        </div>

        <div className="form-row">
          {showState ? (
            <div className="form-group">
              <label className="form-label">{f.locationRegion==='canada'?'Province':'State'} <span style={{color:'var(--gold)'}}>*</span></label>
              <select className="form-select" value={f.state} onChange={e=>set('state',e.target.value)}>
                <option value="">Select…</option>
                {stateOpts.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <Err>{errors.state}</Err>}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Country <span style={{color:'var(--gold)'}}>*</span></label>
              <input className="form-input" value={f.country} onChange={e=>set('country',e.target.value)} placeholder="e.g. Germany, Australia" />
              {errors.country && <Err>{errors.country}</Err>}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Format</label>
            <select className="form-select" value={f.fmt} onChange={e=>set('fmt',e.target.value)}>
              <option value="in-person">In-Person</option>
              <option value="virtual">Virtual</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* ── Abstract ── */}
        <div className="section-label">Abstract submission</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Submission opens</label>
            <input className="form-input" type="date" value={f.aOpen} onChange={e=>set('aOpen',e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Submission deadline</label>
            <input className="form-input" type="date" value={f.aClose} onChange={e=>set('aClose',e.target.value)} />
          </div>
        </div>

        {/* ── Details ── */}
        <div className="section-label">Additional details</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">CME credits</label>
            <input className="form-input" type="number" min="0" value={f.cme} onChange={e=>set('cme',e.target.value)} placeholder="e.g. 20" />
          </div>
          <div className="form-group">
            <label className="form-label">Website</label>
            <input className="form-input" type="url" value={f.website} onChange={e=>set('website',e.target.value)} placeholder="https://…" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tags <span style={{color:'var(--txt3)',fontWeight:'400',textTransform:'none',letterSpacing:0,fontSize:'10px'}}>(comma-separated)</span></label>
          <input className="form-input" value={f.tags} onChange={e=>set('tags',e.target.value)} placeholder="e.g. Trauma, Residents, CME, Robotic Surgery" />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Session details, eligibility, special requirements…" />
        </div>

        {saved && (
          <div className="success-msg" style={{ marginBottom: '12px' }}>
            ✅ Conference added successfully! It is now live in the directory.
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-outline" onClick={() => setF(EMPTY)}>Clear form</button>
          <Link to="/admin" className="btn-outline" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Cancel</Link>
          <button type="submit" className="btn-gold">✓ Add to directory</button>
        </div>
      </form>

      {/* JSON update instructions */}
      <div className="card" style={{ marginTop: '1.5rem', background: 'var(--surf)' }}>
        <div className="section-label">Permanent database updates</div>
        <p style={{ fontSize: '12px', color: 'var(--txt2)', lineHeight: '1.7', marginBottom: '10px' }}>
          Conferences added above are stored in the browser and <strong>reset after a redeploy</strong>. To permanently add a conference, edit <code style={{ fontSize:'11px', background:'var(--card)', padding:'1px 6px', borderRadius:'4px' }}>src/data/conferences.json</code>:
        </p>
        <pre style={{ fontSize: '11px', background: 'var(--navy)', color: '#9fE1CB', padding: '12px', borderRadius: '8px', overflow: 'auto', lineHeight: '1.6' }}>{`{
  "id": 999,
  "name": "Conference Full Name",
  "org": "Org Abbreviation",
  "spec": "Specialty Name",
  "start": "2026-MM-DD",
  "end": "2026-MM-DD",
  "city": "City",
  "state": "XX",        // null if international
  "country": "USA",
  "region": "us",       // "us" or "international"
  "fmt": "in-person",   // "in-person" / "virtual" / "hybrid"
  "aOpen": "2025-MM-DD",
  "aClose": "2025-MM-DD",
  "cme": 20,
  "website": "https://…",
  "notes": "Brief notes.",
  "tags": ["Tag1", "Tag2"]
}`}</pre>
        <p style={{ fontSize: '11px', color: 'var(--txt3)', marginTop: '8px' }}>After editing, bump <code style={{ fontSize:'11px' }}>"lastUpdated"</code> in the <code style={{ fontSize:'11px' }}>_meta</code> block, then rebuild and redeploy.</p>
      </div>
    </div>
  );
}

function Err({ children }) {
  return <div style={{ fontSize: '11px', color: 'var(--close-tx)', marginTop: '4px' }}>{children}</div>;
}
