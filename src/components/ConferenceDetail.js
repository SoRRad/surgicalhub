import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStatus, STATUS_LABEL, STATUS_CLASS, DEADLINE_COLOR, fmtDate, daysLeft } from '../utils';

export default function ConferenceDetail({ conferences, bookmarks, toggleBookmark }) {
  const { id } = useParams();
  const c = conferences.find(x => String(x.id) === String(id));
  if (!c) return <div style={{padding:'2rem',textAlign:'center'}}><h3>Conference not found</h3><Link to="/" style={{color:'var(--gold)'}}>← Back</Link></div>;

  const s = getStatus(c);
  const dl = daysLeft(c.aClose);
  const bked = bookmarks.includes(c.id);
  const mapQ = encodeURIComponent((c.venueAddress || c.city + ' ' + c.country));

  return (
    <div style={{padding:'1.5rem',maxWidth:'960px',margin:'0 auto'}}>
      <div style={{fontSize:'12px',color:'var(--txt3)',marginBottom:'1rem'}}>
        <Link to="/" style={{color:'var(--gold)',textDecoration:'none'}}>Directory</Link> › {c.name}
      </div>

      <div style={{background:'var(--navy)',borderRadius:'16px',padding:'1.5rem',marginBottom:'1rem',borderTop:'4px solid var(--gold)'}}>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'10px'}}>
          <span className="b-spec">{c.spec}</span>
          <span className={`badge ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
        </div>
        <div style={{fontSize:'22px',fontWeight:'500',color:'#fff',marginBottom:'4px',fontFamily:"'DM Serif Display',serif"}}>{c.name}</div>
        <div style={{fontSize:'13px',color:'rgba(255,255,255,.55)',marginBottom:'14px'}}>{c.org}</div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <a href={c.website} target="_blank" rel="noreferrer"
            style={{background:'var(--gold)',color:'var(--navy)',padding:'8px 18px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',textDecoration:'none'}}>
            Visit Official Site →
          </a>
          <button onClick={() => toggleBookmark(c.id)}
            style={{background:bked?'rgba(201,146,42,.2)':'rgba(255,255,255,.1)',color:'#fff',border:`0.5px solid ${bked?'var(--gold2)':'rgba(255,255,255,.3)'}`,padding:'8px 18px',borderRadius:'8px',fontSize:'12px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
            {bked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <div className="card">
          <SectionLabel>Conference dates</SectionLabel>
          <DRow label="Start">{fmtDate(c.start)}</DRow>
          <DRow label="End">{fmtDate(c.end)}</DRow>
          <DRow label="Format"><span style={{textTransform:'capitalize'}}>{c.fmt}</span></DRow>
          <DRow label="Region">{c.region==='us'?'United States':'International'}</DRow>
        </div>
        <div className="card">
          <SectionLabel>Abstract submission</SectionLabel>
          <DRow label="Opens">{fmtDate(c.aOpen)}</DRow>
          <DRow label="Deadline"><span style={{color:DEADLINE_COLOR[s],fontWeight:'600'}}>{fmtDate(c.aClose)}</span></DRow>
          <DRow label="Status"><span className={`badge ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span></DRow>
          {dl !== null && dl > 0 && s !== 'upcoming' && (
            <DRow label="Days left"><span style={{fontWeight:'600',color:dl<=30?'#d97706':'var(--navy)'}}>{dl} days</span></DRow>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <div className="card">
          <SectionLabel>CME credits</SectionLabel>
          {c.cme ? (
            <>
              <div style={{textAlign:'center',padding:'.75rem 0'}}>
                <div style={{fontSize:'40px',fontWeight:'500',color:'var(--gold)',fontFamily:"'DM Serif Display',serif",lineHeight:1}}>{c.cme}</div>
                <div style={{fontSize:'12px',color:'var(--txt2)',marginTop:'4px'}}>AMA PRA Category 1 Credits™</div>
              </div>
              {c.tags?.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'10px',paddingTop:'10px',borderTop:'0.5px solid var(--brd)'}}>
                  {c.tags.map(t => <span key={t} className="tpill">{t}</span>)}
                </div>
              )}
            </>
          ) : <p style={{fontSize:'12px',color:'var(--txt3)'}}>CME info not available.</p>}
        </div>
        <div className="card">
          <SectionLabel>Sessions & tracks</SectionLabel>
          {c.sessions?.length > 0 ? (
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'6px'}}>
              {c.sessions.map(s => (
                <li key={s} style={{display:'flex',gap:'6px',alignItems:'center',fontSize:'12px',color:'var(--txt2)'}}>
                  <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'var(--gold)',flexShrink:0}}></span>{s}
                </li>
              ))}
            </ul>
          ) : <p style={{fontSize:'12px',color:'var(--txt3)'}}>Session info not yet available.</p>}
        </div>
      </div>

      <div className="card" style={{marginBottom:'14px'}}>
        <SectionLabel>Venue & location</SectionLabel>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
          <div>
            <div style={{fontWeight:'500',fontSize:'14px',color:'var(--navy)',marginBottom:'3px'}}>{c.venue || c.city}</div>
            {c.venueAddress && <div style={{fontSize:'12px',color:'var(--txt2)',marginBottom:'6px'}}>{c.venueAddress}</div>}
            <div style={{fontSize:'12px',color:'var(--txt2)',marginBottom:'12px'}}>{c.city}{c.state?', '+c.state:''}, {c.country}</div>
            {c.fmt !== 'virtual' && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`} target="_blank" rel="noreferrer"
                style={{display:'inline-block',background:'var(--navy)',color:'#fff',padding:'7px 14px',borderRadius:'8px',fontSize:'12px',textDecoration:'none'}}>
                Open in Google Maps →
              </a>
            )}
          </div>
          {c.fmt !== 'virtual' && c.venueAddress && (
            <div style={{borderRadius:'10px',overflow:'hidden',border:'0.5px solid var(--brd)',height:'160px'}}>
              <iframe title="map" width="100%" height="160" style={{border:0,display:'block'}} loading="lazy"
                src={`https://maps.google.com/maps?q=${mapQ}&output=embed`} />
            </div>
          )}
        </div>
      </div>

      {c.notes && (
        <div className="card" style={{marginBottom:'14px'}}>
          <SectionLabel>Additional information</SectionLabel>
          <p style={{fontSize:'13px',color:'var(--txt2)',lineHeight:'1.7'}}>{c.notes}</p>
        </div>
      )}

      <Link to="/" style={{color:'var(--gold)',fontSize:'13px',textDecoration:'none'}}>← Back to directory</Link>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'.7px',color:'var(--txt3)',fontWeight:'600',marginBottom:'10px',paddingBottom:'7px',borderBottom:'0.5px solid var(--brd)'}}>{children}</div>;
}
function DRow({ label, children }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px',marginBottom:'7px'}}>
      <span style={{color:'var(--txt3)'}}>{label}</span>
      <span style={{color:'var(--txt)',fontWeight:'500',textAlign:'right'}}>{children}</span>
    </div>
  );
}
