import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatus, STATUS_LABEL, STATUS_CLASS, fmtDate } from '../utils';
import SurgicalHubLogo from '../Logo';

export default function AdminPage({ submissions, onApprove, onReject }) {
  const [tab, setTab] = useState('pending');
  const pending  = submissions.filter(s => s.status === 'pending');
  const approved = submissions.filter(s => s.status === 'approved');
  const rejected = submissions.filter(s => s.status === 'rejected');
  const byTab = { pending, approved, rejected };

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      {/* Admin-only header — completely separate from main nav */}
      <div style={{ background:'var(--navy)', borderBottom:'2px solid var(--gold)', padding:'0 1.5rem', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <SurgicalHubLogo size={30} />
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:'17px', color:'#fff' }}>Surgical<span style={{color:'#E6B44A'}}>Hub</span></span>
          <span style={{ background:'rgba(201,146,42,.25)', color:'var(--gold2)', fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'20px', letterSpacing:'.5px' }}>ADMIN</span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <Link to="/admin/add" style={{ background:'var(--gold)', color:'var(--navy)', padding:'7px 16px', borderRadius:'7px', fontSize:'12px', fontWeight:'600', textDecoration:'none' }}>+ Add conference</Link>
          <Link to="/" style={{ color:'rgba(255,255,255,.55)', fontSize:'12px', padding:'7px 14px', borderRadius:'6px', textDecoration:'none', border:'0.5px solid rgba(255,255,255,.15)' }}>← Back to site</Link>
        </div>
      </div>

      <div style={{ padding:'1.5rem', maxWidth:'960px', margin:'0 auto' }}>
        <h2 style={{ fontSize:'22px', marginBottom:'4px' }}>Conference submissions</h2>
        <p style={{ fontSize:'13px', color:'var(--txt2)', marginBottom:'1.5rem' }}>Review and publish community-submitted conferences.</p>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'1.5rem' }}>
          {[['Pending',pending.length,'#d97706','var(--soon-bg)','pending'],['Approved',approved.length,'#16a34a','var(--open-bg)','approved'],['Rejected',rejected.length,'#dc2626','var(--close-bg)','rejected']].map(([label,n,color,bg,key]) => (
            <button key={key} onClick={() => setTab(key)} style={{ background:bg, borderRadius:'10px', padding:'1rem', textAlign:'center', cursor:'pointer', border:`2px solid ${tab===key?color:'transparent'}`, fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ fontSize:'32px', fontWeight:'600', color, fontFamily:"'DM Serif Display',serif", lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:'11px', color, fontWeight:'600', marginTop:'3px' }}>{label}</div>
            </button>
          ))}
        </div>

        {byTab[tab].length === 0 ? (
          <div className="empty-state"><p>No {tab} submissions.</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {byTab[tab].map(c => <SubmissionCard key={c.id} c={c} tab={tab} onApprove={onApprove} onReject={onReject} />)}
          </div>
        )}

        <div style={{ marginTop:'2rem', paddingTop:'1rem', borderTop:'0.5px solid var(--brd)' }}>
          <p style={{ fontSize:'12px', color:'var(--txt3)' }}>
            To permanently add conferences, edit <code style={{ fontSize:'11px', background:'var(--surf)', padding:'1px 6px', borderRadius:'4px' }}>src/data/conferences.json</code> and redeploy.
            See the <Link to="/admin/add" style={{ color:'var(--gold)' }}>Add Conference page</Link> for the JSON template.
          </p>
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({ c, tab, onApprove, onReject }) {
  const s = getStatus(c);
  const col = tab==='approved'?'#16a34a':tab==='rejected'?'#dc2626':'#d97706';
  return (
    <div className="card" style={{ borderLeft:`4px solid ${col}`, borderRadius:'0 12px 12px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'6px' }}>
            <span className="b-spec">{c.spec||'General Surgery'}</span>
            <span className={`badge ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
          </div>
          <div style={{ fontSize:'15px', fontWeight:'500', color:'var(--navy)', marginBottom:'2px', fontFamily:"'DM Serif Display',serif" }}>{c.name}</div>
          <div style={{ fontSize:'11px', color:'var(--txt3)', marginBottom:'10px' }}>{c.org}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'5px', fontSize:'12px' }}>
            <span><span style={{color:'var(--txt3)'}}>Dates: </span>{fmtDate(c.start)} – {fmtDate(c.end)}</span>
            <span><span style={{color:'var(--txt3)'}}>Location: </span>{c.city||'—'}{c.state?', '+c.state:''}, {c.country||'—'}</span>
            <span><span style={{color:'var(--txt3)'}}>Deadline: </span>{fmtDate(c.aClose)||'—'}</span>
            <span><span style={{color:'var(--txt3)'}}>Format: </span><span style={{textTransform:'capitalize'}}>{c.fmt||'—'}</span></span>
          </div>
          {c.website && <div style={{marginTop:'5px',fontSize:'12px'}}><span style={{color:'var(--txt3)'}}>Website: </span><a href={c.website} target="_blank" rel="noreferrer" style={{color:'var(--gold)'}}>{c.website}</a></div>}
          {c.notes && <div style={{marginTop:'7px',fontSize:'11px',color:'var(--txt2)',background:'var(--surf)',padding:'7px 10px',borderRadius:'6px'}}>{c.notes}</div>}
        </div>
        {tab === 'pending' && (
          <div style={{ display:'flex', gap:'7px', flexShrink:0 }}>
            <button onClick={() => onReject(c.id)} style={{ padding:'7px 14px', background:'var(--close-bg)', color:'var(--close-tx)', border:'0.5px solid rgba(155,28,28,.2)', borderRadius:'7px', cursor:'pointer', fontSize:'12px', fontWeight:'500', fontFamily:"'DM Sans',sans-serif" }}>✕ Reject</button>
            <button onClick={() => onApprove(c.id)} style={{ padding:'7px 14px', background:'var(--open-bg)', color:'var(--open-tx)', border:'0.5px solid rgba(22,163,74,.2)', borderRadius:'7px', cursor:'pointer', fontSize:'12px', fontWeight:'500', fontFamily:"'DM Sans',sans-serif" }}>✓ Approve</button>
          </div>
        )}
      </div>
    </div>
  );
}
