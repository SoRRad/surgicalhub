import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import confData from './data/conferences.json';
import Directory from './components/Directory';
import ConferenceDetail from './components/ConferenceDetail';
import CalendarView from './components/CalendarView';
import AlertsPage from './components/AlertsPage';
import BookmarksPage from './components/BookmarksPage';
import AdminPage from './components/AdminPage';
import AddConferencePage from './components/AddConferencePage';
import SmartSearch from './components/SmartSearch';
import AddModal from './components/AddModal';
import SurgicalHubLogo from './Logo';
import './styles.css';

const LAST_UPDATED = confData._meta?.lastUpdated || '2026-03-19';
const BASE_CONFERENCES = confData.conferences || [];

function NavBar({ onAdd }) {
  const loc = useLocation();
  const p = loc.pathname;
  const isAdmin = p.startsWith('/admin');
  if (isAdmin) return null; // admin has its own header

  return (
    <div className="hdr">
      <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
        <SurgicalHubLogo size={34} />
        <span className="logoname" style={{ marginLeft: '8px' }}>Surgical<span>Hub</span></span>
      </Link>
      <div className="hnav">
        <Link to="/"        className={p === '/'         ? 'act' : ''}>Directory</Link>
        <Link to="/search"  className={p === '/search'   ? 'act' : ''}>Abstract Search</Link>
        <Link to="/calendar" className={p === '/calendar' ? 'act' : ''}>Calendar</Link>
        <Link to="/alerts"  className={p === '/alerts'   ? 'act' : ''}>Email Alerts</Link>
        <Link to="/bookmarks" className={p === '/bookmarks' ? 'act' : ''}>Bookmarks</Link>
        <button className="hbtn" onClick={onAdd}>+ Add Conference</button>
      </div>
    </div>
  );
}

function Footer() {
  const loc = useLocation();
  if (loc.pathname.startsWith('/admin')) return null;
  return (
    <div className="footer">
      <span className="footer-txt">
        SurgicalHub &copy; {new Date().getFullYear()} &nbsp;|&nbsp;
        Last updated: {LAST_UPDATED} &nbsp;|&nbsp;
        Developed by <a href="https://sorrad.github.io/RezaShahriarirad_CV/" target="_blank" rel="noreferrer">Reza Shahriarirad</a>
      </span>
    </div>
  );
}

export default function App() {
  const [submissions, setSubmissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_submissions') || '[]'); } catch { return []; }
  });
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_bk') || '[]'); } catch { return []; }
  });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('sh_submissions', JSON.stringify(submissions)); } catch {}
  }, [submissions]);
  useEffect(() => {
    try { localStorage.setItem('sh_bk', JSON.stringify(bookmarks)); } catch {}
  }, [bookmarks]);

  const approvedSubs = submissions.filter(s => s.status === 'approved');
  const allConferences = [...BASE_CONFERENCES, ...approvedSubs];

  function handleAdd(conf) {
    setSubmissions(prev => [...prev, { ...conf, id: Date.now(), status: 'pending' }]);
    setShowAdd(false);
  }
  function handleApprove(id) {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
  }
  function handleReject(id) {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
  }
  function handleAdminAdd(conf) {
    setSubmissions(prev => [...prev, { ...conf, id: Date.now(), status: 'approved' }]);
  }
  function toggleBookmark(id) {
    setBookmarks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const shared = { conferences: allConferences, bookmarks, toggleBookmark };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar onAdd={() => setShowAdd(true)} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/"             element={<Directory {...shared} />} />
            <Route path="/conference/:id" element={<ConferenceDetail conferences={allConferences} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />} />
            <Route path="/search"       element={<SmartSearch {...shared} />} />
            <Route path="/calendar"     element={<CalendarView conferences={allConferences} />} />
            <Route path="/alerts"       element={<AlertsPage conferences={allConferences} />} />
            <Route path="/bookmarks"    element={<BookmarksPage {...shared} />} />
            {/* Admin routes — completely separate, no main nav */}
            <Route path="/admin"        element={<AdminPage submissions={submissions} onApprove={handleApprove} onReject={handleReject} />} />
            <Route path="/admin/add"    element={<AddConferencePage onAdd={handleAdminAdd} />} />
            <Route path="*"             element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
        {showAdd && <AddModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      </div>
    </Router>
  );
}
