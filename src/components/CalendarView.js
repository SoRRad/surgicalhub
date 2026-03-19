import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStatus, STATUS_LABEL, STATUS_CLASS, SPECIALTIES } from '../utils';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function makeICS(conferences) {
  const lines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SurgicalHub//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'
  ];
  conferences.filter(c => c.aClose).forEach(c => {
    const dt = c.aClose.replace(/-/g,'');
    const now = new Date().toISOString().replace(/[-:.]/g,'').slice(0,15)+'Z';
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:sh-dl-${c.id}@surgicalhub`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${dt}`);
    lines.push(`SUMMARY:Abstract Deadline: ${c.name}`);
    lines.push(`DESCRIPTION:${c.org} · ${c.spec}\\nWebsite: ${c.website||''}\\n${c.notes||''}`);
    lines.push(`URL:${c.website||''}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICS(conferences, label = 'surgicalhub_deadlines') {
  const blob = new Blob([makeICS(conferences)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${label}.ics`; a.click();
  URL.revokeObjectURL(url);
}

export default function CalendarView({ conferences }) {
  const now = new Date();
  const [yr, setYr]   = useState(now.getFullYear());
  const [mo, setMo]   = useState(now.getMonth());
  // Calendar filters
  const [specs, setSpecs]     = useState([]);
  const [region, setRegion]   = useState('all');
  const [dlOnly, setDlOnly]   = useState(false);

  function prev() { if(mo===0){setMo(11);setYr(y=>y-1);}else setMo(m=>m-1); }
  function next() { if(mo===11){setMo(0);setYr(y=>y+1);}else setMo(m=>m+1); }
  function toggleSpec(s){ setSpecs(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]); }

  const filtered = useMemo(() => {
    let r = conferences;
    if (specs.length > 0) r = r.filter(c => specs.includes(c.spec));
    if (region !== 'all') r = r.filter(c => region==='us' ? c.region==='us' : region==='canada' ? c.country==='Canada' : c.region==='international');
    return r;
  }, [conferences, specs, region]);

  function pad(n){ return String(n).padStart(2,'0'); }
  function ds(d){ return `${yr}-${pad(mo+1)}-${pad(d)}`; }
  function confsForDay(d){ const s=ds(d); return filtered.filter(c=>c.start<=s&&c.end>=s); }
  function dlForDay(d){ const s=ds(d); return filtered.filter(c=>c.aClose===s); }

  const monthConfs = filtered.filter(c=>{
    const s=new Date(c.start); const e=new Date(c.end);
    return (s.getFullYear()===yr&&s.getMonth()===mo)||(e.getFullYear()===yr&&e.getMonth()===mo);
  });
  const monthDl = filtered.filter(c=>{
    if(!c.aClose) return false;
    const d=new Date(c.aClose);
    return d.getFullYear()===yr&&d.getMonth()===mo;
  });

  const first = new Date(yr,mo,1).getDay();
  const days  = new Date(yr,mo+1,0).getDate();
  const cells = [];
  for(let i=0;i<first;i++) cells.push(null);
  for(let d=1;d<=days;d++) cells.push(d);

  const visibleConfs = dlOnly ? monthDl : [...monthConfs,...monthDl.filter(c=>!monthConfs.includes(c))];

  return (
    <div style={{padding:'1.5rem'}}>
      <div style={{display:'grid',gridTemplateColumns:'200px 1fr 260px',gap:'14px',alignItems:'start'}}>

        {/* LEFT: Filters */}
        <div className="sidebar" style={{position:'static',maxHeight:'none',borderRight:'none',border:'0.5px solid var(--brd)',borderRadius:'12px'}}>
          <div className="sfilt-title">Calendar filters</div>

          <div className="sfilt-section">
            <div className="sfilt-label">Specialty</div>
            {SPECIALTIES.map(s=>(
              <label key={s} className="sfilt-check">
                <input type="checkbox" checked={specs.includes(s)} onChange={()=>toggleSpec(s)}/> {s}
              </label>
            ))}
          </div>

          <div className="sfilt-section">
            <div className="sfilt-label">Region</div>
            {[['all','All'],['us','United States'],['canada','Canada'],['international','International']].map(([v,l])=>(
              <button key={v} className={`sfilt-btn${region===v?' act':''}`} onClick={()=>setRegion(v)}>{l}</button>
            ))}
          </div>

          <div className="sfilt-section">
            <label className="sfilt-check">
              <input type="checkbox" checked={dlOnly} onChange={e=>setDlOnly(e.target.checked)}/> Deadlines only
            </label>
          </div>

          <button className="clr-btn" onClick={()=>{setSpecs([]);setRegion('all');setDlOnly(false);}}>Clear filters</button>

          {/* Download ICS */}
          <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'0.5px solid var(--brd)'}}>
            <div className="sfilt-label" style={{marginBottom:'6px'}}>Export calendar</div>
            <button className="sfilt-btn" onClick={()=>downloadICS(filtered.filter(c=>c.aClose),`surgicalhub_deadlines_${MONTHS[mo]}_${yr}`)}>
              📅 Download deadlines (.ics)
            </button>
            <button className="sfilt-btn" onClick={()=>downloadICS(filtered,'surgicalhub_all_conferences')}>
              📅 Download all dates (.ics)
            </button>
            <p style={{fontSize:'9px',color:'var(--txt3)',marginTop:'4px',lineHeight:'1.5'}}>Opens in Google Calendar, Apple Calendar, Outlook & more.</p>
          </div>
        </div>

        {/* CENTER: Calendar grid */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
            <button className="btn-outline" style={{padding:'6px 14px'}} onClick={prev}>‹</button>
            <h2 style={{fontSize:'20px'}}>{MONTHS[mo]} {yr}</h2>
            <button className="btn-outline" style={{padding:'6px 14px'}} onClick={next}>›</button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:'4px'}}>
            {DAYS.map(d=>(
              <div key={d} style={{textAlign:'center',fontSize:'10px',fontWeight:'600',color:'var(--txt3)',textTransform:'uppercase',letterSpacing:'.5px',padding:'3px 0'}}>{d}</div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px'}}>
            {cells.map((d,i)=>{
              if(!d) return <div key={`e${i}`}></div>;
              const dc = confsForDay(d);
              const dl = dlForDay(d);
              const isToday = now.getFullYear()===yr&&now.getMonth()===mo&&d===now.getDate();
              return (
                <div key={d} style={{minHeight:'68px',padding:'4px',borderRadius:'6px',background:isToday?'rgba(11,30,61,.05)':'transparent',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surf)'}
                  onMouseLeave={e=>e.currentTarget.style.background=isToday?'rgba(11,30,61,.05)':'transparent'}>
                  <div style={{fontSize:'12px',color:isToday?'#fff':'var(--txt2)',background:isToday?'var(--navy)':'transparent',width:'20px',height:'20px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'2px'}}>{d}</div>
                  {!dlOnly && dc.slice(0,2).map(c=>(
                    <div key={c.id} style={{fontSize:'9px',background:'var(--navy)',color:'#fff',borderRadius:'3px',padding:'1px 4px',marginBottom:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{c.org}</div>
                  ))}
                  {dl.map(c=>(
                    <div key={`d${c.id}`} style={{fontSize:'9px',background:'#dc2626',color:'#fff',borderRadius:'3px',padding:'1px 4px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>⏰{c.org}</div>
                  ))}
                  {!dlOnly && dc.length>2 && <div style={{fontSize:'8px',color:'var(--txt3)'}}>+{dc.length-2}</div>}
                </div>
              );
            })}
          </div>

          <div style={{display:'flex',gap:'14px',marginTop:'12px',paddingTop:'10px',borderTop:'0.5px solid var(--brd)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'var(--txt2)'}}><span style={{width:'10px',height:'10px',background:'var(--navy)',borderRadius:'2px',display:'inline-block'}}></span>Conference</div>
            <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'var(--txt2)'}}><span style={{width:'10px',height:'10px',background:'#dc2626',borderRadius:'2px',display:'inline-block'}}></span>Abstract deadline</div>
          </div>
        </div>

        {/* RIGHT: Sidebar list */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <div className="card">
            <div className="sfilt-title">This month ({monthConfs.length})</div>
            {monthConfs.length===0
              ? <p style={{fontSize:'12px',color:'var(--txt3)'}}>No conferences this month.</p>
              : monthConfs.map(c=>(
                <Link key={c.id} to={`/conference/${c.id}`} style={{textDecoration:'none',display:'block',marginBottom:'8px',paddingBottom:'8px',borderBottom:'0.5px solid var(--brd)'}}>
                  <div style={{fontSize:'12px',fontWeight:'500',color:'var(--navy)'}}>{c.name}</div>
                  <div style={{fontSize:'10px',color:'var(--txt3)'}}>{c.org} · {c.city}</div>
                </Link>
              ))
            }
          </div>
          <div className="card">
            <div className="sfilt-title">Deadlines this month ({monthDl.length})</div>
            {monthDl.length===0
              ? <p style={{fontSize:'12px',color:'var(--txt3)'}}>No deadlines this month.</p>
              : monthDl.map(c=>{
                const s=getStatus(c);
                return (
                  <Link key={c.id} to={`/conference/${c.id}`} style={{textDecoration:'none',display:'block',marginBottom:'7px'}}>
                    <div style={{fontSize:'12px',fontWeight:'500',color:'var(--navy)'}}>{c.org}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:'10px',color:'var(--txt3)'}}>{c.aClose}</span>
                      <span className={`badge ${STATUS_CLASS[s]}`} style={{fontSize:'9px'}}>{STATUS_LABEL[s]}</span>
                    </div>
                  </Link>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
