import React, { useState } from 'react';
import { daysLeft, SPECIALTIES } from '../utils';

const DEADLINE_OPTS = ['7 days','14 days','30 days','60 days'];

export default function AlertsPage({ conferences }) {
  const [email, setEmail]           = useState('');
  const [name, setName]             = useState('');
  const [selSpecs, setSelSpecs]     = useState([]);
  const [selDl, setSelDl]           = useState(['14 days']);
  const [submitted, setSubmitted]   = useState(false);
  const [err, setErr]               = useState('');

  function toggleSpec(s){ setSelSpecs(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]); }
  function toggleDl(d){ setSelDl(p => p.includes(d) ? p.filter(x=>x!==d) : [...p,d]); }
  function selectAll(){ setSelSpecs([...SPECIALTIES]); }
  function clearAll(){ setSelSpecs([]); }

  function submit(e){
    e.preventDefault();
    if (!email.trim()){ setErr('Please enter your email.'); return; }
    if (!email.includes('@')){ setErr('Please enter a valid email.'); return; }
    setErr(''); setSubmitted(true);
  }

  const upcoming60 = conferences
    .filter(c => { const dl = daysLeft(c.aClose); return dl !== null && dl > 0 && dl <= 60; })
    .sort((a,b) => new Date(a.aClose)-new Date(b.aClose))
    .slice(0,10);

  if (submitted) return (
    <div style={{padding:'2rem',maxWidth:'600px',margin:'0 auto'}}>
      <div className="card" style={{textAlign:'center',padding:'2.5rem'}}>
        <div style={{fontSize:'44px',marginBottom:'14px'}}>✅</div>
        <h2 style={{fontSize:'22px',marginBottom:'8px'}}>You're subscribed!</h2>
        <p style={{fontSize:'13px',color:'var(--txt2)',lineHeight:'1.7',marginBottom:'6px'}}>
          Alerts will be sent to <strong>{email}</strong>
        </p>
        <p style={{fontSize:'13px',color:'var(--txt2)',lineHeight:'1.7',marginBottom:'18px'}}>
          Notify {selDl.length>0?selDl.join(', '):'14 days'} before deadlines
          {selSpecs.length>0?` for: ${selSpecs.slice(0,3).join(', ')}${selSpecs.length>3?` +${selSpecs.length-3} more`:''}`:' across all specialties'}.
        </p>
        <div style={{background:'var(--surf)',borderRadius:'10px',padding:'12px',marginBottom:'18px',fontSize:'12px',color:'var(--txt2)'}}>
          <strong>Note:</strong> Email alerts require a backend service. This is a demonstration of the alert preferences UI. To enable real email alerts, connect a service like SendGrid, Mailchimp, or EmailJS to the platform. See the <a href="#/admin" style={{color:'var(--gold)'}}>Admin</a> panel for setup instructions.
        </div>
        <button className="btn-primary" onClick={() => setSubmitted(false)}>Update preferences</button>
      </div>
    </div>
  );

  return (
    <div style={{padding:'1.5rem',maxWidth:'960px',margin:'0 auto'}}>
      <h2 style={{fontSize:'24px',marginBottom:'4px'}}>Email alerts</h2>
      <p style={{fontSize:'13px',color:'var(--txt2)',marginBottom:'1.5rem'}}>
        Set your preferences below. <strong>Note:</strong> actual email delivery requires a backend email service — see setup instructions in the Admin panel.
      </p>

      <div style={{background:'var(--soon-bg)',border:'0.5px solid rgba(201,146,42,.3)',borderRadius:'10px',padding:'10px 14px',fontSize:'12px',color:'var(--soon-tx)',marginBottom:'1.25rem'}}>
        ⚙️ <strong>Backend required:</strong> To send real emails, connect an email API (SendGrid, EmailJS, or Mailchimp) and add your API key to the platform. This form saves preferences only. See Admin → Setup for integration steps.
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'16px',alignItems:'start'}}>
        <form className="card" onSubmit={submit}>
          <div className="section-label">Your information</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Dr. Jane Smith" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span style={{color:'var(--gold)'}}>*</span></label>
              <input className="form-input" type="email" placeholder="jane@hospital.edu" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
          </div>

          <div className="section-label">Notify me this far in advance</div>
          <div className="chips-wrap" style={{marginBottom:'1rem'}}>
            {DEADLINE_OPTS.map(d => (
              <button key={d} type="button" className={`chip${selDl.includes(d)?' sel':''}`} onClick={()=>toggleDl(d)}>{d}</button>
            ))}
          </div>

          <div className="section-label" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>Specialties (leave blank for all)</span>
            <div style={{display:'flex',gap:'6px'}}>
              <button type="button" onClick={selectAll} style={{fontSize:'10px',color:'var(--gold)',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Select all</button>
              <button type="button" onClick={clearAll} style={{fontSize:'10px',color:'var(--txt3)',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Clear</button>
            </div>
          </div>
          <div className="chips-wrap" style={{marginBottom:'1rem'}}>
            {SPECIALTIES.map(s => (
              <button key={s} type="button" className={`chip${selSpecs.includes(s)?' sel':''}`} onClick={()=>toggleSpec(s)}
                style={{fontSize:'10px',padding:'3px 9px'}}>{s}</button>
            ))}
          </div>

          {err && <div style={{background:'var(--close-bg)',color:'var(--close-tx)',padding:'9px 12px',borderRadius:'8px',fontSize:'12px',marginBottom:'10px'}}>{err}</div>}

          <button type="submit" className="btn-gold" style={{width:'100%',padding:'11px'}}>🔔 Save alert preferences</button>
          <p style={{fontSize:'10px',color:'var(--txt3)',textAlign:'center',marginTop:'8px'}}>Preferences are saved locally. Real emails require backend setup.</p>
        </form>

        <div className="card">
          <div className="section-label">Upcoming deadlines (60 days)</div>
          {upcoming60.length === 0
            ? <p style={{fontSize:'12px',color:'var(--txt3)'}}>No upcoming deadlines.</p>
            : upcoming60.map(c => {
              const dl = daysLeft(c.aClose);
              return (
                <div key={c.id} style={{marginBottom:'10px',paddingBottom:'10px',borderBottom:'0.5px solid var(--brd)'}}>
                  <div style={{fontSize:'12px',fontWeight:'500',color:'var(--navy)',marginBottom:'2px'}}>{c.name}</div>
                  <div style={{fontSize:'10px',color:'var(--txt3)',marginBottom:'3px'}}>{c.org} · {c.spec}</div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:'10px',color:'var(--txt2)'}}>{c.aClose}</span>
                    <span style={{fontSize:'11px',fontWeight:'600',color:dl<=14?'#dc2626':dl<=30?'#d97706':'#16a34a'}}>{dl}d left</span>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}
