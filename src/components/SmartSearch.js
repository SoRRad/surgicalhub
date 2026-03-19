import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDeadlineStatus, formatDate, daysUntil, statusLabel } from '../utils';
import '../styles.css';

// Weighted scoring fields — each field has a multiplier for relevance ranking
const SEARCH_FIELDS = [
  { key: 'name',      weight: 10 },
  { key: 'org',       weight: 6  },
  { key: 'specialty', weight: 8  },
  { key: 'sessions',  weight: 7  },  // array — joined
  { key: 'tags',      weight: 7  },  // array — joined
  { key: 'notes',     weight: 4  },
  { key: 'city',      weight: 3  },
  { key: 'country',   weight: 3  },
  { key: 'venue',     weight: 2  },
];

// Medical keyword synonym map — expands user terms to related terms
const SYNONYMS = {
  'minimally invasive': ['laparoscopic', 'robotic', 'endoscopic', 'sages', 'miss'],
  'laparoscopic':       ['minimally invasive', 'robotic', 'endoscopic'],
  'robotic':            ['minimally invasive', 'laparoscopic', 'da vinci'],
  'colon':              ['colorectal', 'rectal', 'ascrs', 'cds', 'bowel'],
  'rectal':             ['colorectal', 'colon', 'ascrs'],
  'colorectal':         ['colon', 'rectal', 'ascrs', 'cds'],
  'heart':              ['cardiac', 'cardiothoracic', 'sts', 'transplant', 'ishlt'],
  'cardiac':            ['heart', 'cardiothoracic', 'sts'],
  'lung':               ['thoracic', 'cardiothoracic', 'sts', 'transplant'],
  'thoracic':           ['cardiothoracic', 'heart', 'lung', 'sts'],
  'transplant':         ['heart transplant', 'lung transplant', 'ishlt'],
  'spine':              ['neurosurgery', 'cns', 'orthopedic', 'back'],
  'brain':              ['neurosurgery', 'cns', 'neuro'],
  'neuro':              ['neurosurgery', 'brain', 'spine', 'cns'],
  'vascular':           ['svs', 'avf', 'endovascular', 'aorta', 'carotid'],
  'breast':             ['asbrS', 'oncoplastic', 'reconstruction', 'mastectomy'],
  'orthopedic':         ['orthopaedic', 'aaos', 'joint', 'bone', 'fracture'],
  'orthopaedic':        ['orthopedic', 'aaos'],
  'trauma':             ['emergency surgery', 'acute care'],
  'cme':                ['credits', 'continuing medical education', 'ama'],
  'resident':           ['fellows', 'training', 'education'],
  'fellow':             ['resident', 'training', 'education'],
  'international':      ['global', 'europe', 'world', 'european'],
  'virtual':            ['online', 'remote', 'webinar'],
};

function expandTerms(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded = new Set(terms);
  terms.forEach(term => {
    Object.entries(SYNONYMS).forEach(([key, values]) => {
      if (key.includes(term) || term.includes(key)) {
        values.forEach(v => expanded.add(v.toLowerCase()));
      }
    });
  });
  return [...expanded];
}

function scoreConference(conf, terms) {
  let totalScore = 0;
  let matchedTerms = new Set();
  let matchedFields = new Set();

  terms.forEach(term => {
    SEARCH_FIELDS.forEach(({ key, weight }) => {
      const raw = Array.isArray(conf[key]) ? conf[key].join(' ') : (conf[key] || '');
      const val = raw.toLowerCase();
      if (val.includes(term)) {
        const termFreq = (val.match(new RegExp(term, 'g')) || []).length;
        totalScore += weight * (1 + Math.log(termFreq));
        matchedTerms.add(term);
        matchedFields.add(key);
      }
    });
  });

  // Boost if abstract is still open
  const status = getDeadlineStatus(conf.abstractOpen, conf.abstractClose);
  if (status === 'open') totalScore *= 1.2;
  if (status === 'soon') totalScore *= 1.1;

  return { score: totalScore, matchedTerms: [...matchedTerms], matchedFields: [...matchedFields] };
}

function highlight(text, terms) {
  if (!text || !terms.length) return text;
  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: '#FBF3E3', color: '#92400E', borderRadius: '3px', padding: '0 2px' }}>{part}</mark>
      : part
  );
}

export default function SmartSearch({ conferences }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    const terms = expandTerms(submitted);
    return conferences
      .map(c => ({ conf: c, ...scoreConference(c, terms) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [submitted, conferences]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return results;
    return results.filter(r => getDeadlineStatus(r.conf.abstractOpen, r.conf.abstractClose) === statusFilter);
  }, [results, statusFilter]);

  function handleSearch(e) {
    e.preventDefault();
    setSubmitted(query.trim());
  }

  const suggestions = [
    'robotic surgery CME', 'colorectal US conference', 'minimally invasive resident',
    'cardiac transplant international', 'breast oncoplastic', 'neurosurgery spine fellow',
    'vascular endovascular', 'virtual online 2026',
  ];

  return (
    <div className="main-content" style={{ maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Abstract & Keyword Search</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Describe your research focus, keywords, or abstract topic and we'll rank the most relevant conferences for you.
      </p>

      {/* Search box */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Describe your abstract topic or enter keywords
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <textarea
              className="form-input"
              style={{ flex: 1, minHeight: '90px', resize: 'vertical', fontSize: '14px', lineHeight: '1.6' }}
              placeholder="e.g. robotic colorectal surgery outcomes in elderly patients&#10;or: minimally invasive CME resident training&#10;or: breast reconstruction oncoplastic US conference"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>Try:</span>
              {suggestions.map(s => (
                <button key={s} type="button"
                  onClick={() => { setQuery(s); setSubmitted(s); }}
                  style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", border: '0.5px solid var(--border-strong)',
                    background: 'var(--surface)', color: 'var(--text-secondary)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  {s}
                </button>
              ))}
            </div>
            <button type="submit" className="btn-gold" style={{ padding: '10px 28px', whiteSpace: 'nowrap' }}>
              🔍 Find Conferences
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {submitted && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--navy)' }}>
                {results.length === 0 ? 'No matches found' : `${results.length} conference${results.length !== 1 ? 's' : ''} matched`}
              </span>
              {results.length > 0 && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  for "{submitted}"
                </span>
              )}
            </div>
            {results.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>Filter:</span>
                {[['all', 'All'], ['open', 'Open'], ['soon', 'Closing Soon'], ['closed', 'Closed']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setStatusFilter(val)}
                    style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", border: '0.5px solid',
                      borderColor: statusFilter === val ? 'var(--navy)' : 'var(--border-strong)',
                      background: statusFilter === val ? 'var(--navy)' : 'var(--surface)',
                      color: statusFilter === val ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}>
                    {lbl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔬</div>
              <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '8px' }}>No conferences matched your search</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Try broader terms or different keywords — e.g. use the specialty name or a procedure type.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((r, idx) => (
                <SearchResultCard key={r.conf.id} result={r} rank={idx + 1} totalResults={filtered.length} searchTerms={expandTerms(submitted)} />
              ))}
            </div>
          )}
        </>
      )}

      {!submitted && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '0.5px dashed var(--border-strong)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🩺</div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Enter your abstract topic or keywords above</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
            We match your search against conference names, specialties, sessions, tags, and notes — then rank results by relevance. Medical synonyms are automatically expanded.
          </p>
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ result, rank, totalResults, searchTerms }) {
  const { conf: c, score, matchedTerms, matchedFields } = result;
  const status = getDeadlineStatus(c.abstractOpen, c.abstractClose);
  const days = daysUntil(c.abstractClose);
  const relevancePct = Math.min(100, Math.round((score / (score + 5)) * 100));
  const isTop = rank <= 3;

  return (
    <Link to={`/conference/${c.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{
        cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
        borderLeft: isTop ? `4px solid ${rank === 1 ? '#C9922A' : rank === 2 ? '#8A96A8' : '#A8835A'}` : '0.5px solid var(--border)',
        borderRadius: isTop ? '0 12px 12px 0' : '12px',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = isTop ? (rank === 1 ? '#C9922A' : rank === 2 ? '#8A96A8' : '#A8835A') : 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {/* Rank badge */}
          <div style={{
            flexShrink: 0, width: '44px', height: '44px', borderRadius: '10px',
            background: rank === 1 ? 'var(--gold)' : rank === 2 ? '#8A96A8' : rank === 3 ? '#A8835A' : 'var(--surface)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: rank <= 3 ? '#fff' : 'var(--text-muted)', fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>#{rank}</span>
            {rank === 1 && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', letterSpacing: '0.5px' }}>BEST</span>}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge-specialty">{c.specialty}</span>
                <span className={`badge badge-${status}`}>{statusLabel(status)}</span>
                {c.format !== 'in-person' && (
                  <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: c.format === 'virtual' ? '#f5f3ff' : '#fff7ed', color: c.format === 'virtual' ? '#7c3aed' : '#c2410c', border: `0.5px solid ${c.format === 'virtual' ? 'rgba(124,58,237,0.3)' : 'rgba(194,65,12,0.3)'}`, textTransform: 'capitalize' }}>
                    {c.format}
                  </span>
                )}
              </div>
              {/* Relevance bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Relevance</span>
                <div style={{ width: '80px', height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${relevancePct}%`, height: '100%', background: relevancePct >= 80 ? '#16a34a' : relevancePct >= 50 ? '#d97706' : '#8A96A8', borderRadius: '3px', transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '30px' }}>{relevancePct}%</span>
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontFamily: "'DM Serif Display', serif", color: 'var(--navy)', marginBottom: '3px', lineHeight: '1.3' }}>
              {highlight(c.name, searchTerms)}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{c.org} · {c.city}, {c.country}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginBottom: '10px' }}>
              <MiniStat icon="📅" label="Conference">{formatDate(c.confStart)}</MiniStat>
              <MiniStat icon="⏰" label="Abstract deadline">
                <span style={{ color: status === 'open' ? '#16a34a' : status === 'closed' ? '#dc2626' : '#d97706', fontWeight: '600' }}>
                  {formatDate(c.abstractClose)}
                  {days > 0 && status !== 'upcoming' && ` · ${days}d left`}
                </span>
              </MiniStat>
              {c.cme && <MiniStat icon="🎓" label="CME">{c.cme} credits</MiniStat>}
              {c.region && <MiniStat icon="🌍" label="Region">{c.region === 'us' ? 'United States' : 'International'}</MiniStat>}
            </div>

            {/* Matched fields explanation */}
            {matchedTerms.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: 'var(--surface)', borderRadius: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '1px' }}>Matched:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {matchedTerms.slice(0, 8).map(t => (
                    <span key={t} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#FBF3E3', color: '#92400E', border: '0.5px solid rgba(201,146,42,0.3)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions that matched */}
            {c.sessions && matchedFields.includes('sessions') && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {c.sessions.slice(0, 4).map(s => (
                  <span key={s} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface)', color: 'var(--text-secondary)', border: '0.5px solid var(--border-strong)' }}>
                    {highlight(s, searchTerms)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ icon, label, children }) {
  return (
    <div>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>{icon} {label}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }}>{children}</div>
    </div>
  );
}
