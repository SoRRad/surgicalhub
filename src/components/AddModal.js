import React, { useState, useRef } from 'react';
import { SPECIALTIES, US_STATES } from '../utils';

const CA = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];
const EMPTY = { name:'',org:'',spec:'',start:'',end:'',city:'',locationRegion:'us',state:'',country:'USA',fmt:'in-person',aOpen:'',aClose:'',cme:'',website:'',notes:'' };

export default function AddModal({ onClose, onSubmit }) {
  const [tab, setTab] = useState('manual'); // 'manual' | 'url'
  const [f, setF] = useState(EMPTY);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [parseMsg, setParseMsg] = useState('');

  function set(k, v) {
    setF(prev => {
      const n = { ...prev, [k]: v };
      if (k === 'locationRegion') {
        n.country = v === 'us' ? 'USA' : v === 'canada' ? 'Canada' : '';
        n.state = '';
      }
      return n;
    });
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  }

  // Auto-fill from URL using Claude API (via public proxy or direct)
  async function fetchFromUrl() {
    if (!url.trim()) return;
    setLoading(true);
    setParseMsg('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Extract conference details from this URL: ${url.trim()}\n\nReturn ONLY a JSON object with these exact keys (use null for missing):\n{"name":"","org":"","start":"YYYY-MM-DD","end":"YYYY-MM-DD","city":"","state":"XX or null","country":"USA","fmt":"in-person","aOpen":"YYYY-MM-DD or null","aClose":"YYYY-MM-DD or null","cme":null,"website":"","notes":"","spec":"matching one of: Breast & Melanoma Surgical Oncology, Cardiothoracic Surgery, Cardiovascular Surgery, Colon & Rectal Surgery, Endocrine Surgery, General Surgery, Hepatobiliary & Pancreas Surgery, Metabolic & Abdominal Wall Reconstructive Surgery, Neurologic Surgery, Obstetrics & Gynecology Surgery, Oral & Maxillofacial Surgery, Orthopedic Surgery, Otolaryngology / Head & Neck Surgery, Pediatric Surgery, Plastic & Reconstructive Surgery, Surgical Education, Surgical Oncology, Thoracic Surgery, Transplant Surgery, Trauma Critical Care & General Surgery, Vascular Surgery","tags":[]}\n\nReturn only JSON, no markdown.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      let parsed = null;
      try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()); } catch {}
      if (parsed && parsed.name) {
        const region = parsed.country === 'USA' ? 'us' : parsed.country === 'Canada' ? 'canada' : 'international';
        setF(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          org: parsed.org || prev.org,
          spec: parsed.spec || prev.spec,
          start: parsed.start || prev.start,
          end: parsed.end || prev.end,
          city: parsed.city || prev.city,
          state: parsed.state || prev.state,
          country: parsed.country || prev.country,
          locationRegion: region,
          fmt: parsed.fmt || prev.fmt,
          aOpen: parsed.aOpen || prev.aOpen,
          aClose: parsed.aClose || prev.aClose,
          cme: parsed.cme ? String(parsed.cme) : prev.cme,
          website: parsed.website || url.trim(),
          notes: parsed.notes || prev.notes,
        }));
        setParseMsg('✓ Fields auto-filled from the URL. Please review and correct any details.');
        setTab('manual');
      } else {
        setParseMsg('⚠ Could not extract details automatically. Please fill in manually.');
        setTab('manual');
      }
    } catch {
      setParseMsg('⚠ Could not reach the URL. Please fill in manually.');
      setTab('manual');
    }
    setLoading(false);
  }

  function validate() {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.org.trim())  e.org  = 'Required';
    if (!f.spec)        e.spec = 'Required';
    if (!f.start)       e.start = 'Required';
    if (!f.city.trim()) e.city = 'Required';
    if (f.locationRegion === 'us' && !f.state)     e.state = 'Required';
    if (f.locationRegion === 'canada' && !f.state) e.state = 'Required';
    if (f.locationRegion === 'international' && !f.country.trim()) e.country = 'Required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      name: f.name.trim(), org: f.org.trim(), spec: f.spec,
      start: f.start, end: f.end || f.start,
      city: f.city.trim(),
      state: (f.locationRegion !== 'international') ? f.state : null,
      country: f.locationRegion === 'us' ? 'USA' : f.locationRegion === 'canada' ? 'Canada' : f.country.trim(),
      region: f.locationRegion === 'us' ? 'us' : 'international',
      fmt: f.fmt, aOpen: f.aOpen || null, aClose: f.aClose || null,
      cme: f.cme ? Number(f.cme) : null,
      website: f.website.trim() || null,
      notes: f.notes.trim() || null, tags: [],
    });
    setDone(true);
  }

  const showState = f.locationRegion === 'us' || f.locationRegion === 'canada';
  const stateOpts = f.locationRegion === 'canada' ? CA : US_STATES;

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(11,30,61,.5)',
    zIndex: 100, display: 'flex', alignItems: 'flex-start',
    justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto'
  };

  if (done) return (
    <div style={overlayStyle} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'var(--card)', borderRadius:'16px', width:'100%', maxWidth:'500px', border:'0.5px solid var(--brd)', marginTop:'2rem', padding:'2.5rem', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'14px' }}>📬</div>
        <h3 style={{ fontSize:'20px', marginBottom:'8px' }}>Submitted for review!</h3>
        <p style={{ fontSize:'13px', color:'var(--txt2)', marginBottom:'20px' }}>Go to <a href="#/admin" style={{ color:'var(--gold)' }}>Admin panel</a> to approve and publish it.</p>
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div style={overlayStyle} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'var(--card)', borderRadius:'16px', width:'100%', maxWidth:'600px', border:'0.5px solid var(--brd)', marginTop:'1rem' }}>

        {/* Header */}
        <div style={{ background:'var(--navy)', padding:'1.1rem 1.4rem', borderRadius:'16px 16px 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'17px', fontWeight:'500', color:'#fff', fontFamily:"'DM Serif Display',serif" }}>Add a conference</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:'22px', cursor:'pointer' }}>×</button>
        </div>

        {/* Mode tabs */}
        <div style={{ display:'flex', borderBottom:'0.5px solid var(--brd)', background:'var(--surf)' }}>
          {[['manual','✏️ Enter manually'],['url','🔗 Import from URL']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ flex:1, padding:'12px', border:'none', background:'transparent', fontFamily:"'DM Sans',sans-serif",
                fontSize:'13px', fontWeight:tab===v?'600':'400',
                color:tab===v?'var(--navy)':'var(--txt3)', cursor:'pointer',
                borderBottom:tab===v?'2px solid var(--navy)':'2px solid transparent' }}>
              {l}
            </button>
          ))}
        </div>

        {/* URL import tab */}
        {tab === 'url' && (
          <div style={{ padding:'1.5rem' }}>
            <p style={{ fontSize:'13px', color:'var(--txt2)', marginBottom:'1rem', lineHeight:'1.6' }}>
              Paste the conference webpage URL and we'll automatically extract the details.
            </p>
            <div className="form-group">
              <label className="form-label">Conference webpage URL</label>
              <input className="form-input" type="url" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://www.conferencename.org/2026-annual-meeting"
                onKeyDown={e => e.key === 'Enter' && fetchFromUrl()} />
            </div>
            {parseMsg && (
              <div style={{ background: parseMsg.startsWith('✓') ? 'var(--open-bg)' : 'var(--soon-bg)',
                color: parseMsg.startsWith('✓') ? 'var(--open-tx)' : 'var(--soon-tx)',
                padding:'9px 12px', borderRadius:'8px', fontSize:'12px', marginBottom:'12px' }}>
                {parseMsg}
              </div>
            )}
            <button className="btn-gold" style={{ width:'100%', padding:'11px' }}
              onClick={fetchFromUrl} disabled={loading}>
              {loading ? '⏳ Extracting details…' : '🔍 Extract conference details'}
            </button>
            <p style={{ fontSize:'11px', color:'var(--txt3)', marginTop:'8px', textAlign:'center' }}>
              After extraction, you can review and edit in the manual form.
            </p>
          </div>
        )}

        {/* Manual form tab */}
        {tab === 'manual' && (
          <form onSubmit={handleSubmit}>
            <div style={{ padding:'1.25rem', maxHeight:'65vh', overflowY:'auto' }}>
              {parseMsg && parseMsg.startsWith('✓') && (
                <div style={{ background:'var(--open-bg)', color:'var(--open-tx)', padding:'9px 12px', borderRadius:'8px', fontSize:'12px', marginBottom:'12px' }}>{parseMsg}</div>
              )}
              <div className="section-label">Conference information</div>
              <div className="form-group">
                <label className="form-label">Name <Req /></label>
                <input className="form-input" value={f.name} onChange={e=>set('name',e.target.value)} placeholder="Full conference name" />
                {errors.name && <Err>{errors.name}</Err>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Organization <Req /></label>
                  <input className="form-input" value={f.org} onChange={e=>set('org',e.target.value)} placeholder="e.g. ACS, SAGES" />
                  {errors.org && <Err>{errors.org}</Err>}
                </div>
                <div className="form-group">
                  <label className="form-label">Specialty <Req /></label>
                  <select className="form-select" value={f.spec} onChange={e=>set('spec',e.target.value)}>
                    <option value="">Select…</option>
                    {SPECIALTIES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.spec && <Err>{errors.spec}</Err>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start date <Req /></label>
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
                  <label className="form-label">Region <Req /></label>
                  <select className="form-select" value={f.locationRegion} onChange={e=>set('locationRegion',e.target.value)}>
                    <option value="us">United States</option>
                    <option value="canada">Canada</option>
                    <option value="international">Other international</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City <Req /></label>
                  <input className="form-input" value={f.city} onChange={e=>set('city',e.target.value)} placeholder="e.g. Chicago" />
                  {errors.city && <Err>{errors.city}</Err>}
                </div>
              </div>
              <div className="form-row">
                {showState ? (
                  <div className="form-group">
                    <label className="form-label">{f.locationRegion==='canada'?'Province':'State'} <Req /></label>
                    <select className="form-select" value={f.state} onChange={e=>set('state',e.target.value)}>
                      <option value="">Select…</option>
                      {stateOpts.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <Err>{errors.state}</Err>}
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Country <Req /></label>
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

function Req() { return <span style={{color:'var(--gold)'}}>*</span>; }
function Err({ children }) { return <div style={{ fontSize:'11px', color:'var(--close-tx)', marginTop:'3px' }}>{children}</div>; }
