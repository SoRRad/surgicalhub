import React from 'react';
import { Link } from 'react-router-dom';
import { getStatus, STATUS_LABEL, STATUS_CLASS, fmtDate, fmtShort, daysLeft, DEADLINE_COLOR, exportBookmarksCSV } from '../utils';

export default function BookmarksPage({ conferences, bookmarks, toggleBookmark }) {
  const bked = conferences.filter(c => bookmarks.includes(c.id));

  return (
    <div style={{padding:'1.5rem',maxWidth:'1100px',margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px',flexWrap:'wrap',gap:'10px'}}>
        <h2 style={{fontSize:'24px'}}>Bookmarks</h2>
        {bked.length > 0 && (
          <button className="btn-outline" onClick={() => exportBookmarksCSV(bked)}
            style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV ({bked.length})
          </button>
        )}
      </div>
      <p style={{fontSize:'13px',color:'var(--txt2)',marginBottom:'1.5rem'}}>
        Your saved conferences. Click the bookmark icon on any card to save. Use Export CSV to download all details.
      </p>

      {bked.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:'36px',marginBottom:'8px'}}>🔖</div>
          <p>No bookmarks yet. <Link to="/" style={{color:'var(--gold)'}}>Browse the directory</Link> and bookmark conferences to track them here.</p>
        </div>
      ) : (
        <>
          {/* Deadline alerts summary */}
          {bked.filter(c => { const dl = daysLeft(c.aClose); return dl !== null && dl > 0 && dl <= 60; }).length > 0 && (
            <div style={{background:'var(--soon-bg)',border:'0.5px solid rgba(201,146,42,.3)',borderRadius:'10px',padding:'12px 16px',marginBottom:'1.25rem'}}>
              <div style={{fontSize:'12px',fontWeight:'600',color:'var(--soon-tx)',marginBottom:'6px'}}>⏰ Upcoming deadlines for your bookmarks</div>
              {bked
                .filter(c => { const dl = daysLeft(c.aClose); return dl !== null && dl > 0 && dl <= 60; })
                .sort((a,b) => new Date(a.aClose)-new Date(b.aClose))
                .map(c => {
                  const dl = daysLeft(c.aClose);
                  return (
                    <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px',marginBottom:'3px'}}>
                      <span style={{color:'var(--txt2)'}}>{c.name}</span>
                      <span style={{fontWeight:'600',color:dl<=14?'#dc2626':dl<=30?'#d97706':'#16a34a',whiteSpace:'nowrap',marginLeft:'12px'}}>{dl}d left — {c.aClose}</span>
                    </div>
                  );
                })
              }
            </div>
          )}

          <div className="conf-grid">
            {bked.map(c => <BookmarkCard key={c.id} c={c} toggleBookmark={toggleBookmark} />)}
          </div>
        </>
      )}
    </div>
  );
}

function BookmarkCard({ c, toggleBookmark }) {
  const s = getStatus(c);
  const dl = daysLeft(c.aClose);
  const dlText = dl !== null ? (dl > 0 ? `${dl}d left` : `${Math.abs(dl)}d ago`) : '';
  return (
    <div className="conf-card" style={{position:'relative'}}>
      <button className="bk-btn bked" onClick={() => toggleBookmark(c.id)} title="Remove bookmark">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="#fff" stroke="#fff" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <Link to={`/conference/${c.id}`} style={{textDecoration:'none',display:'block'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px',marginTop:'4px'}}>
          <span className="b-spec">{c.spec}</span>
          <span className={`badge ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
        </div>
        <div style={{fontSize:'14px',fontWeight:'500',color:'var(--navy)',lineHeight:'1.3',marginBottom:'2px',fontFamily:"'DM Serif Display',serif"}}>{c.name}</div>
        <div style={{fontSize:'11px',color:'var(--txt3)',marginBottom:'10px'}}>{c.org}</div>
        <div style={{fontSize:'11px',color:'var(--txt2)',marginBottom:'4px'}}>📅 {fmtShort(c.start)} – {fmtShort(c.end)}, {new Date(c.start+'T00:00:00').getFullYear()}</div>
        <div style={{fontSize:'11px',color:'var(--txt2)',marginBottom:'10px'}}>📍 {c.city}{c.state?', '+c.state:''}, {c.country}</div>
        <div style={{height:'0.5px',background:'var(--brd)',margin:'8px 0'}}></div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px'}}>
          <span style={{color:'var(--txt2)'}}>Deadline</span>
          <span style={{fontWeight:'500',color:DEADLINE_COLOR[s]}}>{fmtDate(c.aClose)}{dlText?' · '+dlText:''}</span>
        </div>
      </Link>
    </div>
  );
}
