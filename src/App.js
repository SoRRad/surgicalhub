import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Directory from './components/Directory';
import ConferenceDetail from './components/ConferenceDetail';
import CalendarView from './components/CalendarView';
import AlertsPage from './components/AlertsPage';
import AdminPanel from './components/AdminPanel';
import SmartSearch from './components/SmartSearch';
import SubmitModal from './components/SubmitModal';
import conferences from './data/conferences.json';

export default function App() {
  const [showSubmit, setShowSubmit] = useState(false);
  const [pending, setPending] = useState([]);

  function handleSubmission(conf) {
    setPending(prev => [...prev, { ...conf, id: Date.now(), status: 'pending' }]);
    setShowSubmit(false);
  }

  function handleApprove(id) {
    setPending(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
  }

  function handleReject(id) {
    setPending(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
  }

  const allConferences = [
    ...conferences,
    ...pending.filter(c => c.status === 'approved')
  ];

  return (
    <Router>
      <Header onSubmit={() => setShowSubmit(true)} />
      {showSubmit && (
        <SubmitModal onClose={() => setShowSubmit(false)} onSubmit={handleSubmission} />
      )}
      <Routes>
        <Route path="/"               element={<Directory      conferences={allConferences} />} />
        <Route path="/conference/:id" element={<ConferenceDetail conferences={allConferences} />} />
        <Route path="/calendar"       element={<CalendarView   conferences={allConferences} />} />
        <Route path="/alerts"         element={<AlertsPage     conferences={allConferences} />} />
        <Route path="/search"         element={<SmartSearch    conferences={allConferences} />} />
        <Route path="/admin"          element={<AdminPanel     pending={pending} onApprove={handleApprove} onReject={handleReject} />} />
      </Routes>
    </Router>
  );
}
