export const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

export function getStatus(c) {
  if (!c.aClose) return 'tbd';
  const cl = new Date(c.aClose + 'T00:00:00');
  const op = c.aOpen ? new Date(c.aOpen + 'T00:00:00') : null;
  const confEnd = new Date(c.end + 'T00:00:00');
  if (confEnd < today) return 'past';
  if (cl < today) return 'closed';
  if (op && op > today) return 'upcoming';
  const diff = Math.ceil((cl - today) / 864e5);
  return diff <= 30 ? 'soon' : 'open';
}

export const STATUS_LABEL = { open:'Open', closed:'Closed', soon:'Closing Soon', upcoming:'Not Yet Open', past:'Past', tbd:'TBD' };
export const STATUS_CLASS = { open:'b-open', closed:'b-closed', soon:'b-soon', upcoming:'b-upcoming', past:'b-past', tbd:'b-past' };
export const DEADLINE_COLOR = { open:'#16a34a', closed:'#dc2626', soon:'#d97706', past:'#888780', upcoming:'#d97706', tbd:'#888780' };

export function fmtDate(d) {
  if (!d) return '—';
  const x = new Date(d + 'T00:00:00');
  return x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function fmtShort(d) {
  if (!d) return '—';
  const x = new Date(d + 'T00:00:00');
  return x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function daysLeft(d) {
  if (!d) return null;
  return Math.ceil((new Date(d + 'T00:00:00') - today) / 864e5);
}

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT',
  'VT','VA','WA','WV','WI','WY'
];

export const SPECIALTIES = [
  'Breast & Melanoma Surgical Oncology',
  'Cardiothoracic Surgery',
  'Cardiovascular Surgery',
  'Colon & Rectal Surgery',
  'Endocrine Surgery',
  'General Surgery',
  'Hepatobiliary & Pancreas Surgery',
  'Metabolic & Abdominal Wall Reconstructive Surgery',
  'Neurologic Surgery',
  'Obstetrics & Gynecology Surgery',
  'Oral & Maxillofacial Surgery',
  'Orthopedic Surgery',
  'Otolaryngology / Head & Neck Surgery',
  'Pediatric Surgery',
  'Plastic & Reconstructive Surgery',
  'Surgical Education',
  'Surgical Oncology',
  'Thoracic Surgery',
  'Transplant Surgery',
  'Trauma, Critical Care & General Surgery',
  'Vascular Surgery',
];

export function exportBookmarksCSV(conferences) {
  const headers = ['Name','Organization','Specialty','Conference Start','Conference End','City','State','Country','Format','Abstract Opens','Abstract Deadline','CME Credits','Website','Notes','Tags'];
  const rows = conferences.map(c => [
    `"${c.name}"`,
    `"${c.org}"`,
    `"${c.spec}"`,
    c.start,
    c.end,
    `"${c.city || ''}"`,
    `"${c.state || ''}"`,
    `"${c.country || ''}"`,
    c.fmt,
    c.aOpen || '',
    c.aClose || '',
    c.cme || '',
    `"${c.website || ''}"`,
    `"${(c.notes || '').replace(/"/g, "'")}"`,
    `"${(c.tags || []).join('; ')}"`
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'surgicalhub_bookmarks.csv';
  a.click();
  URL.revokeObjectURL(url);
}
