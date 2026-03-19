import React, { useState } from 'react';
import { SPECIALTIES, US_STATES } from '../utils';

const CA_PROVINCES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

const EMPTY = {
  name:'', org:'', spec:'', start:'', end:'', city:'',
  locationRegion:'us', state:'', country:'USA',
  fmt:'in-person', aOpen:'', aClose:'', cme:'', website:'', notes:'',
};

export default function SubmitModal({ onClose, onSubmit }) {
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  function set(k, v) {
    setF(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'locationRegion') {
        if (v === 'us')     { next.country = 'USA';    next.state = ''; }
        else if (v === 'canada') { next.country = 'Canada'; next.state = ''; }
        else                { next.country = '';       next.state = ''; }
      }
      return next;
    });
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  }

  function validate() {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.org.trim())  e.org  = 'Required';
    if (!f.spec)        e.spec = 'Required';
    if (!f.start)       e.start = 'Required';
    if (!f.city.trim()) e.city = 'Required';
    if (f.locationRegion === 'us'     && !f.state)          e.state   = 'Required';
    if (f.locationRegion === 'canada' && !f.state)          e.state   = 'Required';
    if (f.locationRegion === 'international' && !f.country.trim()) e.country = 'Required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      name:    f.name.trim(),
      org:     f.org.trim(),
      spec:    f.spec,
      start:   f.start,
      end:     f.end || f.start,
      city:    f.city.trim(),
      state:   (f.locationRegion !== 'international') ? f.state : null,
      country: f.locationRegion === 'us' ? 'USA' : f.locationRegion === 'canada' ? 'Canada' : f.country.trim(),
      region:  f.locationRegion === 'us' ? 'us' : 'international',
      fmt:     f.fmt,
      aOpen:   f.aOpen || null,
      aClose:  f.aClose || null,
      cme:     f.cme ? Number(f.cme) : null,
      website: f.website.trim() || null,
      notes:   f.notes.trim() || null,
      tags:    [],
    });
    setDone(true);
  }

  const showState = f.locationRegion === 'us' || f.locationRegion === 'canada';
  const stateOpts = f.locationRegion === 'canada' ? CA_PROVINCES : US_STATES;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(11,30,61,.5)', zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'2rem 1rem', overflowY:'auto' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'var(--card)', borderRadius:'16px', width:'100%', maxWidth:'580px', border:'0.5px solid var(--brd)', marginTop:'2rem' }}>

        <div style={{ background:'var(--navy)', padding:'1.1rem 1.4rem', borderRadius:'16px 16px 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'17px', fontWeight:'500', color:'#fff', fontFamily:"'DM Serif Display',serif" }}>Submit a conference</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:'22px', cursor:'pointer', lineHeight:1 }}>×</button>
        </div>

        {done ? (
          <div style={{ padding:'2.5rem', textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>📬</div>
            <h3 style={{ fontSize:'20px', marginBottom:'8px' }}>Submitted for review!</h3>
            <p style={{ fontSize:'13px', color:'var(--txt2)', marginBottom:'20px' }}>Your conference will appear in the Admin panel for review. Once approved, it will show in the directory.</p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ padding:'1.25rem', maxHeight:'70vh', overflowY:'auto' }}>
              <div className="section-label">Conference information</div>
              <div className="form-group">
                <label className="form-label">Name <span style={{color:'var(--gold)'}}>*</span></label>
                <input className="form-input" value={f.name} onChange={e=>set('name',e.target.value)} placeholder="Full conference name" />
                {errors.name && <Err>{errors.name}</Err>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Organization <span style={{color:'var(--gold)'}}>*</span></label>
                  <input className="form-input" value={f.org} onChange={e=>set('org',e.target.value)} placeholder="e.g. ACS, SAGES" />
                  {errors.org && <Err>{errors.org}</Err>}
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty <span style={{color:'var(--gold)'}}>*</span></label>
                  <select className="form-select" value={f.spec} onChange={e=>set('spec',e.target.value)}>
                    <option value="">Select…</option>
                    {SPECIALTIES.map(s=><option key={s} value={s}>{s}</option>)}
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
                  <label className="form-label">End date</label>
                  <input className="form-input" type="date" value={f.end} onChange={e=>set('end',e.target.value)} />
                </div>
              </div>

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
                    <input className="form-input" value={f.country} onChange={e=>set('country',e.target.value)} placeholder="e.g. Germany" />
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

              <div className="section-label">Abstract submission</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Opens</label>
                  <input className="form-input" type="date" value={f.aOpen} onChange={e=>set('aOpen',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input className="form-input" type="date" value={f.aClose} onChange={e=>set('aClose',e.target.value)} />
                </div>
              </div>

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
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Session topics, eligibility, special info…" />
              </div>
            </div>

            <div style={{ padding:'.9rem 1.4rem', borderTop:'0.5px solid var(--brd)', display:'flex', justifyContent:'flex-end', gap:'8px' }}>
              <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary">Submit for review →</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Err({ children }) {
  return <div style={{ fontSize:'11px', color:'var(--close-tx)', marginTop:'3px' }}>{children}</div>;
}
