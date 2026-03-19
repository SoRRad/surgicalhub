import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStatus, STATUS_LABEL, STATUS_CLASS, DEADLINE_COLOR, fmtDate, fmtShort, daysLeft } from '../utils';

const SYNONYMS = {
  'colorectal':['colon','rectal','ascrs','cds','bowel'],'colon':['colorectal','rectal'],'rectal':['colorectal','colon'],
  'minimally invasive':['laparoscopic','robotic','endoscopic','sages','mis'],'laparoscopic':['minimally invasive','robotic'],
  'robotic':['minimally invasive','laparoscopic'],'hernia':['abdominal wall','sages','ahs'],
  'bariatric':['metabolic','obesity','asmbs','sleeve','bypass'],'metabolic':['bariatric','obesity'],
  'heart':['cardiac','cardiothoracic','sts','cardiovascular'],'cardiac':['heart','cardiothoracic','sts'],
  'thoracic':['cardiothoracic','lung','sts'],'lung':['thoracic','cardiothoracic'],
  'transplant':['liver transplant','kidney transplant','asts','tts','ilts'],
  'spine':['neurosurgery','cns','aans','orthopedic','scoliosis','srs'],
  'brain':['neurosurgery','cns','aans','cerebrovascular'],'neuro':['neurosurgery','brain','spine'],
  'vascular':['svs','avf','scvs','endovascular','aorta','carotid'],
  'breast':['asbrS','oncoplastic','reconstruction','mastectomy','sso'],
  'orthopedic':['orthopaedic','aaos','joint','bone','fracture','spine'],'orthopaedic':['orthopedic','aaos'],
  'trauma':['east','aast','emergency surgery','acute care'],'critical care':['sccm','icu','trauma','east'],
  'endocrine':['thyroid','aaes','ata','parathyroid','adrenal'],
  'thyroid':['endocrine','aaes','ata','parathyroid'],
  'plastic':['reconstruction','microsurgery','asps','aaps','psrc'],
  'reconstruction':['plastic','microsurgery','flap'],
  'ent':['otolaryngology','head neck','aao-hns'],'otolaryngology':['ent','head neck','aao-hns'],
  'cme':['credits','continuing medical education'],'resident':['fellow','training','education'],
  'virtual':['online','remote'],'international':['global','europe','world'],
  'hpb':['hepatobiliary','pancreas','liver','ahpba','ihpba'],
  'liver':['hepatobiliary','transplant','hpb','aasld'],'pancreas':['hpb','hepatobiliary','ahpba'],
};

function expandTerms(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const exp = new Set(terms);
  terms.forEach(t => {
    Object.entries(SYNONYMS).forEach(([k,vals]) => {
      if (k.includes(t)||t.includes(k)) vals.forEach(v=>exp.add(v.toLowerCase()));
    });
  });
  return [...exp];
}

function scoreConf(c, terms) {
  let score = 0;
  const fields = [{k:'name',w:10},{k:'spec',w:8},{k:'org',w:6},{k:'notes',w:4},{k:'tags',w:7},{k:'city',w:2}];
  terms.forEach(t => {
    fields.forEach(({k,w}) => {
      const v = (Array.isArray(c[k])?c[k].join(' '):(c[k]||'')).toLowerCase();
      if (v.includes(t)) score += w;
    });
  });
  const s = getStatus(c);
  if (s==='open') score*=1.2;
  if (s==='soon') score*=1.1;
  return score;
}

const SUGGESTIONS = [
  'robotic colorectal surgery','vascular endovascular aorta','minimally invasive bariatric',
  'breast reconstruction oncoplastic','neurosurgery spine fellow','cardiac transplant',
  'trauma critical care','orthopedic joint replacement','hernia abdominal wall',
  'thyroid endocrine CME','pediatric surgery','head neck otolaryngology',
];

export default function SmartSearch({ conferences, bookmarks, toggleBookmark }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    const terms = expandTerms(submitted);
    return conferences
      .map(c => ({ c, score: scoreConf(c, terms) }))
      .filter(r => r.score > 0)
      .sort((a,b) => b.score-a.score);
  }, [submitted, conferences]);

  const filtered = useMemo(() => {
    if (statusFilter==='all') return results;
    return results.filter(r => getStatus(r.c)===statusFilter);
  }, [results, statusFilter]);

  function doSearch(q) {
    const v = q || query;
    setQuery(v);
    setSubmitted(v.trim());
  }

  return (
    <div style={{padding:'1.5rem',maxWidth:'960px',margin:'0 auto'}}>
      <h2 style={{fontSize:'24px',marginBottom:'4px'}}>Abstract & keyword search</h2>
      <p style={{fontSize:'13px',color:'var(--txt2)',marginBottom:'1.25rem'}}>Describe your research topic or keywords — we'll rank conferences by relevance.</p>

      <div className="card" style={{marginBottom:'1.25rem'}}>
        <label className="form-label">Your abstract topic or keywords</label>
        <textarea className="form-textarea" style={{minHeight:'85px',fontSize:'13px'}}
          placeholder={'e.g. robotic colorectal surgery outcomes\nor: minimally invasive bariatric hernia\nor: vascular endovascular aorta stent graft'}
          value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&e.ctrlKey) doSearch(); }}
        />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'10px',flexWrap:'wrap',gap:'8px'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'5px',alignItems:'center'}}>
            <span style={{fontSize:'11px',color:'var(--txt3)'}}>Try:</span>
            {SUGGESTIONS.map(s=>(
              <button key={s} type="button" onClick={()=>doSearch(s)}
                style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",border:'0.5px solid var(--brd2)',background:'var(--surf)',color:'var(--txt2)',transition:'all .12s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--brd2)';e.currentTarget.style.color='var(--txt2)';}}>
                {s}
              </button>
            ))}
          </div>
          <button className="btn-gold" onClick={()=>doSearch()}>🔍 Find Conferences</button>
        </div>
      </div>

      {submitted && (
        <>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'10px'}}>
            <span style={{fontSize:'14px',fontWeight:'500',color:'var(--navy)'}}>
              {results.length===0?'No matches found':`${results.length} conference${results.length!==1?'s':''} matched`}
              {results.length>0&&<span style={{fontSize:'13px',color:'var(--txt3)',marginLeft:'8px'}}>for "{submitted}"</span>}
            </span>
            {results.length>0&&(
              <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                {[['all','All'],['open','Open'],['soon','Closing Soon'],['closed','Closed']].map(([v,l])=>(
                  <button key={v} type="button" onClick={()=>setStatusFilter(v)}
                    className={`chip${statusFilter===v?' sel':''}`} style={{padding:'4px 11px',fontSize:'11px'}}>{l}</button>
                ))}
              </div>
            )}
          </div>

          {filtered.length===0
            ? <div className="empty-state"><p>No conferences matched. Try different keywords.</p></div>
            : filtered.map(({c,score},i)=>{
              const s=getStatus(c);
              const dl=daysLeft(c.aClose);
              const pct=Math.min(100,Math.round(score/(score+8)*100));
              return (
                <div key={c.id} className="card" style={{marginBottom:'10px',cursor:'pointer'}}>
                  <div style={{display:'flex',gap:'12px'}}>
                    <div style={{width:'42px',height:'42px',borderRadius:'10px',background:i===0?'var(--gold)':i===1?'#8A96A8':i===2?'#A8835A':'var(--surf)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'14px',fontWeight:'500',color:i<3?'#fff':'var(--txt3)'}}># {i+1}</span>
                      {i===0&&<span style={{fontSize:'8px',color:'rgba(255,255,255,.8)'}}>BEST</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'6px',marginBottom:'6px'}}>
                        <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                          <span className="b-spec">{c.spec}</span>
                          <span className={`badge ${STATUS_CLASS[s]}`}>{STATUS_LABEL[s]}</span>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',color:'var(--txt3)'}}>
                          Relevance
                          <div style={{width:'60px',height:'5px',background:'var(--surf)',borderRadius:'3px',overflow:'hidden'}}>
                            <div style={{width:`${pct}%`,height:'100%',background:pct>=70?'#16a34a':pct>=40?'#d97706':'#888',borderRadius:'3px'}}></div>
                          </div>
                          {pct}%
                        </div>
                      </div>
                      <Link to={`/conference/${c.id}`} style={{textDecoration:'none'}}>
                        <div style={{fontSize:'15px',fontWeight:'500',color:'var(--navy)',marginBottom:'2px',fontFamily:"'DM Serif Display',serif"}}>{c.name}</div>
                        <div style={{fontSize:'11px',color:'var(--txt3)',marginBottom:'8px'}}>{c.org} · {c.city}{c.state?', '+c.state:''}, {c.country}</div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                          <MiniStat label="Conference">{fmtShort(c.start)}</MiniStat>
                          <MiniStat label="Deadline"><span style={{color:DEADLINE_COLOR[s]}}>{c.aClose||'TBD'}{dl&&dl>0?` · ${dl}d`:''}</span></MiniStat>
                          {c.cme&&<MiniStat label="CME">{c.cme} credits</MiniStat>}
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </>
      )}

      {!submitted&&(
        <div className="empty-state" style={{border:'0.5px dashed var(--brd2)'}}>
          <div style={{fontSize:'32px',marginBottom:'10px'}}>🩺</div>
          <p>Enter your abstract topic or keywords above. We match against conference names, specialties, sessions, and tags — then rank by relevance with medical synonym expansion.</p>
        </div>
      )}
    </div>
  );
}

function MiniStat({label,children}){
  return (
    <div>
      <div style={{fontSize:'9px',textTransform:'uppercase',color:'var(--txt3)',letterSpacing:'.5px',marginBottom:'2px'}}>{label}</div>
      <div style={{fontSize:'11px',fontWeight:'500'}}>{children}</div>
    </div>
  );
}
