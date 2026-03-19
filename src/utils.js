export const today = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

export function getDeadlineStatus(openStr, closeStr) {
  const open = new Date(openStr);
  const close = new Date(closeStr);
  if (today > close) return 'closed';
  if (today < open) return 'upcoming';
  const diffDays = Math.ceil((close - today) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return 'soon';
  return 'open';
}

export function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysUntil(str) {
  const d = new Date(str + 'T00:00:00');
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

export function statusLabel(status) {
  return { open: 'Open', closed: 'Closed', soon: 'Closing Soon', upcoming: 'Not Yet Open' }[status] || '';
}
