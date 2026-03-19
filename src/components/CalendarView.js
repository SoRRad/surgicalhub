import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDeadlineStatus, statusLabel } from '../utils';
import '../styles.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarView({ conferences }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function getConfsForDay(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return conferences.filter(c => {
      if (c.confStart <= dateStr && c.confEnd >= dateStr) return true;
      if (c.abstractClose === dateStr) return true;
      return false;
    });
  }

  function getDeadlinesForDay(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return conferences.filter(c => c.abstractClose === dateStr);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayDay = now.getDate();
  const isThisMonth = now.getFullYear() === year && now.getMonth() === month;

  // Sidebar: conferences this month
  const monthConfs = conferences.filter(c => {
    const start = new Date(c.confStart);
    const end = new Date(c.confEnd);
    return (start.getFullYear() === year && start.getMonth() === month) ||
           (end.getFullYear() === year && end.getMonth() === month);
  });

  const monthDeadlines = conferences.filter(c => {
    const d = new Date(c.abstractClose);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const selectedConfs = selected ? getConfsForDay(selected) : [];
  const selectedDeadlines = selected ? getDeadlinesForDay(selected) : [];

  return (
    <div className="main-content">
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Calendar View</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Month-by-month view of conferences and abstract deadlines.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        {/* Calendar */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: '0.5px solid var(--border-strong)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '16px' }}>‹</button>
            <h2 style={{ fontSize: '20px', fontFamily: "'DM Serif Display', serif", color: 'var(--navy)' }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} style={{ background: 'none', border: '0.5px solid var(--border-strong)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '16px' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '6px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const dayConfs = getConfsForDay(day);
              const dayDeadlines = getDeadlinesForDay(day);
              const isToday = isThisMonth && day === todayDay;
              const isSelected = selected === day;

              return (
                <div key={day} onClick={() => setSelected(isSelected ? null : day)}
                  style={{
                    minHeight: '72px', padding: '6px', borderRadius: '8px', cursor: 'pointer',
                    border: '0.5px solid',
                    borderColor: isSelected ? 'var(--gold)' : isToday ? 'var(--navy)' : 'transparent',
                    background: isSelected ? 'var(--gold-pale)' : isToday ? 'rgba(11,30,61,0.04)' : 'transparent',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isToday ? 'rgba(11,30,61,0.04)' : 'transparent'; }}>
                  <div style={{
                    fontSize: '13px', fontWeight: isToday ? '600' : '400',
                    color: isToday ? 'var(--navy)' : 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}>
                    {isToday ? (
                      <span style={{ background: 'var(--navy)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{day}</span>
                    ) : day}
                  </div>
                  {dayConfs.slice(0, 2).map(c => (
                    <div key={c.id} style={{ fontSize: '9px', background: 'var(--navy)', color: '#fff', borderRadius: '3px', padding: '1px 4px', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {c.org}
                    </div>
                  ))}
                  {dayDeadlines.map(c => (
                    <div key={`d${c.id}`} style={{ fontSize: '9px', background: '#dc2626', color: '#fff', borderRadius: '3px', padding: '1px 4px', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      ⏰ {c.org}
                    </div>
                  ))}
                  {dayConfs.length > 2 && (
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>+{dayConfs.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--navy)', borderRadius: '2px', display: 'inline-block' }} /> Conference dates
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '2px', display: 'inline-block' }} /> Abstract deadline
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Selected day detail */}
          {selected && (selectedConfs.length > 0 || selectedDeadlines.length > 0) && (
            <div className="card">
              <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--navy)', marginBottom: '10px' }}>
                {MONTHS[month]} {selected}
              </div>
              {selectedConfs.map(c => (
                <Link key={c.id} to={`/conference/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--surface)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--navy)' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.org} · {c.city}</div>
                  </div>
                </Link>
              ))}
              {selectedDeadlines.map(c => (
                <div key={`sd${c.id}`} style={{ padding: '8px', borderRadius: '8px', background: '#FEE9E9', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#9B1C1C', marginBottom: '2px' }}>⏰ Abstract Deadline</div>
                  <div style={{ fontSize: '12px', color: '#7f1d1d' }}>{c.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* This month conferences */}
          <div className="card">
            <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', paddingBottom: '8px', borderBottom: '0.5px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '11px' }}>
              Conferences this month
            </div>
            {monthConfs.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No conferences this month.</p>
            ) : monthConfs.map(c => (
              <Link key={c.id} to={`/conference/${c.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--navy)', marginBottom: '2px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.org} · {c.city}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Deadlines this month */}
          <div className="card">
            <div style={{ fontWeight: '600', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', paddingBottom: '8px', borderBottom: '0.5px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Abstract deadlines this month
            </div>
            {monthDeadlines.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No deadlines this month.</p>
            ) : monthDeadlines.map(c => {
              const status = getDeadlineStatus(c.abstractOpen, c.abstractClose);
              return (
                <Link key={c.id} to={`/conference/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--navy)' }}>{c.org}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.abstractClose}</div>
                      <span className={`badge badge-${status}`} style={{ fontSize: '10px' }}>{statusLabel(status)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
