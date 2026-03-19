import React from 'react';

// Surgical scalpel + calendar/grid icon — represents surgery + conference
export default function SurgicalHubLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background diamond/shield */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#0B1E3D"/>
      {/* Grid lines (conference grid) */}
      <line x1="10" y1="15" x2="30" y2="15" stroke="#C9922A" strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="10" y1="21" x2="30" y2="21" stroke="#C9922A" strokeWidth="1" strokeOpacity="0.4"/>
      <line x1="10" y1="27" x2="30" y2="27" stroke="#C9922A" strokeWidth="1" strokeOpacity="0.4"/>
      {/* Scalpel blade - diagonal */}
      <path d="M13 29 L26 10 L28 12 L16 29 Z" fill="#C9922A"/>
      {/* Scalpel handle */}
      <rect x="11" y="27" width="5" height="3" rx="1" fill="#E6B44A" transform="rotate(-45 13 29)"/>
      {/* Highlight on blade */}
      <line x1="16" y1="28" x2="27" y2="11" stroke="#FBF3E3" strokeWidth="0.7" strokeOpacity="0.5"/>
      {/* Small circle — precision/scope */}
      <circle cx="28" cy="13" r="2.5" fill="none" stroke="#E6B44A" strokeWidth="1.5"/>
    </svg>
  );
}
