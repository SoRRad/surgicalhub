import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStatus, STATUS_LABEL, STATUS_CLASS, DEADLINE_COLOR, fmtDate, fmtShort, daysLeft, US_STATES, SPECIALTIES } from '../utils';

const CA = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

export default function Directory({ conferences, bookmarks, toggleBookmark }) {
  const [search, setSearch]             = useState('');
  const [deadline, setDeadline]         = useState('all');
  const [locationRegion, setLocRegion]  = useState('all');
  const [locationState, setLocState]    = useState('');
  const [fmt, setFmt]                   = useState('all');
  const [specs, setSpecs]               = useState([]);
  const [sort, setSort]                 = useState('date-asc');
  const [view, setView]                 = useState('grid');
  const [showPast, setShowPast]         = useState(false);

  function toggleSpec(s) { setSpecs(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]); }
  function clearAll() { setSearch(''); setDeadline('all'); setLocRegion('all'); setLocState(''); setFmt('all'); setSpecs([]); }

  const filtered = useMemo(() => {
    let res = conferences.filter(c => {
      const s = getStatus(c);
      if (!showPast && s === 'past') return false;
      if (deadline !== 'all' && s !== deadline) return false;
      if (locationRegion === 'us'            && c.region !== 'us') return false;
      if (locationRegion === 'canada'        && c.country !== 'Canada') return false;
      if (locationRegion === 'international' && c.region !== 'international') return false;
      if (locationState && c.state !== locationState) return false;
      if (fmt !== 'all' && c.fmt !== fmt) return false;
      if (specs.length > 0 && !specs.includes(c.spec)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(c.name+c.org+c.spec+(c.city||'')+(c.state||'')+(c.country||'')+(c.notes||'')+(c.tags||[]).join(' ')).toLowerCase().includes(q)) return false;
      }
      return true;
    });
    res.sort((a,b) => {
      if (sort==='date-asc')      return new Date(a.start)-new Date(b.start);
      if (sort==='date-desc')     return new Date(b.start)-new Date(a.start);
      if (sort==='deadline-asc')  return new Date(a.aClose||'9999')-new Date(b.aClose||'9999');
      return a.name.localeCompare(b.name);
    });
    return res;
  }, [conferences, search, deadline, locationRegion, locationState, fmt, specs, sort, showPast]);

  const openCount = conferences.filter(c => getStatus(c)==='open').length;
  const soonCount = conferences.filter(c => getStatus(c)==='soon').length;
  const showState = locationRegion === 'us' || locationRegion === 'canada';
  const stateOpts = locationRegion === 'canada' ? CA : US_STATES;

  return (
    <div className="layout">
      {/* SIDEBAR — specialty first */}
      <div className="sidebar">
        <div className="sfilt-title">Filters</div>

        {/* 1. Specialty */}
        <div className="sfilt-section">
          <div className="sfilt-label">Specialty</div>
          {SPECIALTIES.map(s => (
            <label key={s} className="sfilt-check">
              <input type="checkbox" checked={specs.includes(s)} onChange={() => toggleSpec(s)} /> {s}
            </label>
          ))}
        </div>

        {/* 2. Abstract deadline */}
        <div className="sfilt-section">
          <div className="sfilt-label">Abstract deadline</div>
          {[['all','All'],['open','Open'],['soon','Closing Soon'],['closed','Closed'],['upcoming','Not Yet Open']].map(([v,l]) => (
            <button key={v} className={`sfilt-btn${deadline===v?' act':''}`} onClick={() => setDeadline(v)}>{l}</button>
          ))}
        </div>

        {/* 3. Location */}
        <div className="sfilt-section">
          <div className="sfilt-label">Location</div>
          {[['all','All'],['us','United States'],['canada','Canada'],['international','International']].map(([v,l]) => (
            <button key={v} className={`sfilt-btn${locationRegion===v?' act':''}`}
              onClick={() => { setLocRegion(v); setLocState(''); }}>{l}</button>
          ))}
          {showState && (
            <select className="sfilt-select" style={{marginTop:'6px'}} value={locationState} onChange={e => setLocState(e.target.value)}>
              <option value="">All {locationRegion==='canada'?'provinces':'states'}</option>
              {stateOpts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {/* 4. Format */}
        <div className="sfilt-section">
          <div className="sfilt-label">Format</div>
          {[['all','All'],['in-person','In-Person'],['virtual','Virtual'],['hybrid','Hybrid']].map(([v,l]) => (
            <button key={v} className={`sfilt-btn${fmt===v?' act':''}`} onClick={() => setFmt(v)}>{l}</button>
          ))}
        </div>

        <button className="clr-btn" onClick={clearAll}>Clear all filters</button>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div className="searchbox">
            <span className="search-ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input placeholder="Search conferences, specialties, locations…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="date-asc">Date (earliest first)</option>
            <option value="date-desc">Date (latest first)</option>
            <option value="deadline-asc">Deadline (soonest)</option>
            <option value="alpha">A–Z</option>
          </select>
          <label className="past-tog">
            <input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)} /> Show past
          </label>
          <div className="view-tog">
            <button className={`vtbtn${view==='grid'?' act':''}`} onClick={() => setView('grid')}>⊞</button>
            <button className={`vtbtn${view==='list'?' act':''}`} onClick={() => setView('list')}>≡</button>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-pill"><span className="dot" style={{background:'#16a34a'}}></span><strong>{openCount}</strong> open</div>
          <div className="stat-pill"><span className="dot" style={{background:'#d97706'}}></span><strong>{soonCount}</strong> closing soon</div>
          <div className="stat-pill"><strong>{conferences.filter(c=>getStatus(c)!=='past').length}</strong> upcoming</div>
        </div>

        <div className="rcnt">Showing <strong>{filtered.length}</strong> conferences</div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{fontSize:'36px',marginBottom:'8px'}}>🔬</div>
            <p>No conferences match your filters. <button style={{color:'var(--gold)',background:'none',border:'none',cursor:'pointer',fontSize:'14px'}} onClick={clearAll}>Clear filters</button></p>
          </div>
        ) : view === 'grid' ? (
          <div className="conf-grid">
            {filtered.map(c => <ConfCard key={c.id} c={c} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />)}
          </div>
        ) : (
          <ListViewComp conferences={filtered} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
        )}
      </div>
    </div>
  );
}

function ConfCard({ c, bookmarks, toggleBookmark }) {
  const s = getStatus(c);
  const dl = daysLeft(c.aClose);
  const dlText = dl !== null ? (dl > 0 ? `${dl}d left` : `${Math.abs(dl)}d ago`) : '';
  const bked = bookmarks.includes(c.id);
  return (
    <Link to={`/conference/${c.id}`} style={{textDecoration:'none'}}>
      <div className={`conf-card${s==='past'?' is-past':''}`}>
        <button className={`bk-btn${bked?' bked':''}`}
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleBookmark(c.id); }}
          title={bked ? 'Remove bookmark' : 'Bookmark'}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill={bked?'#fff':'none'} stroke={bked?'#fff':'var(--txt3)'} strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px',marginTop:'4px'}}>
          <span className="b-spec">{c.spec}</span>
          <span className={`badge ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
        </div>
        <div style={{fontSize:'14px',fontWeight:'500',color:'var(--navy)',lineHeight:'1.3',marginBottom:'2px',fontFamily:"'DM Serif Display',serif"}}>{c.name}</div>
        <div style={{fontSize:'11px',color:'var(--txt3)',marginBottom:'10px'}}>{c.org}</div>
        <div style={{display:'flex',flexDirection:'column',gap:'4px',marginBottom:'10px'}}>
          <Row>📅 {fmtShort(c.start)} – {fmtShort(c.end)}, {new Date(c.start+'T00:00:00').getFullYear()}</Row>
          <Row>📍 {c.city}{c.state?', '+c.state:''}, {c.country}</Row>
          {c.cme && <Row>🎓 {c.cme} CME credits</Row>}
        </div>
        <div style={{height:'0.5px',background:'var(--brd)',margin:'8px 0'}}></div>
        <div style={{fontSize:'9px',textTransform:'uppercase',letterSpacing:'.8px',color:'var(--txt3)',fontWeight:'600',marginBottom:'5px'}}>Abstract submission</div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',marginBottom:'3px'}}>
          <span style={{color:'var(--txt2)'}}>Opens</span><span style={{fontWeight:'500'}}>{fmtDate(c.aOpen)}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px'}}>
          <span style={{color:'var(--txt2)'}}>Deadline</span>
          <span style={{fontWeight:'500',color:DEADLINE_COLOR[s]}}>{fmtDate(c.aClose)}{dlText?' · '+dlText:''}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'8px'}}>
          <div style={{display:'flex',gap:'4px'}}>
            <span className={`tpill ${c.region==='us'?'us':'intl'}`}>{c.region==='us'?'US':'International'}</span>
            <span className={`tpill ${c.fmt==='virtual'?'virt':c.fmt==='hybrid'?'hyb':''}`} style={{textTransform:'capitalize'}}>{c.fmt}</span>
          </div>
          <span style={{fontSize:'11px',color:'var(--gold)',fontWeight:'500'}}>Details →</span>
        </div>
      </div>
    </Link>
  );
}

function Row({children}){return <div style={{display:'flex',alignItems:'flex-start',gap:'5px',fontSize:'11px',color:'var(--txt2)'}}>{children}</div>;}

function ListViewComp({ conferences, bookmarks, toggleBookmark }) {
  return (
    <div className="list-view">
      <div className="list-hdr"><div>Conference</div><div>Specialty</div><div>Dates</div><div>Location</div><div>Status</div><div></div></div>
      {conferences.map(c => {
        const s = getStatus(c);
        return (
          <Link key={c.id} to={`/conference/${c.id}`} style={{textDecoration:'none'}}>
            <div className={`list-row${s==='past'?' is-past':''}`}>
              <div>
                <div style={{fontWeight:'500',fontSize:'13px',color:'var(--navy)'}}>{c.name}</div>
                <div style={{fontSize:'10px',color:'var(--txt3)',marginTop:'1px'}}>{c.org}</div>
              </div>
              <div style={{fontSize:'11px',color:'var(--txt2)'}}>{c.spec}</div>
              <div style={{fontSize:'12px',color:'var(--txt2)'}}>{fmtShort(c.start)}</div>
              <div style={{fontSize:'12px',color:'var(--txt2)'}}>{c.city}{c.state?', '+c.state:''}</div>
              <div><span className={`badge ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span></div>
              <div>
                <button className={`bk-btn${bookmarks.includes(c.id)?' bked':''}`}
                  onClick={e=>{e.preventDefault();e.stopPropagation();toggleBookmark(c.id);}}
                  style={{position:'static',width:'24px',height:'24px'}}>
                  <svg viewBox="0 0 24 24" width="11" height="11" fill={bookmarks.includes(c.id)?'#fff':'none'} stroke={bookmarks.includes(c.id)?'#fff':'var(--txt3)'} strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
