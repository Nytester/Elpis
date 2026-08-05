import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import './dashboardGlass.css';

const CATEGORIES = ['Lab Results', 'Imaging', 'Visit Summaries', 'Insurance & Billing', 'Consent Forms'];

const TAG_CLASS = {
  'Lab Results': 'gl-tag-accent',
  'Imaging': 'gl-tag-purple',
  'Visit Summaries': 'gl-tag-outline',
  'Insurance & Billing': 'gl-tag-mild',
  'Consent Forms': 'gl-tag-mild',
};

const INITIAL_DOCS = [
  { id: 1, name: 'CBC Panel — Lab Results', category: 'Lab Results', date: 'Jul 14, 2026', by: 'Ochsner Lab', size: '95 KB' },
  { id: 2, name: 'Insurance Pre-Authorization', category: 'Insurance & Billing', date: 'Jun 15, 2026', by: 'Ochsner Billing', size: '210 KB' },
  { id: 3, name: 'Cycle 3 Infusion Summary', category: 'Visit Summaries', date: 'Jun 28, 2026', by: 'Jordan Tran, RN', size: '340 KB' },
  { id: 4, name: 'Chemotherapy Consent Form', category: 'Consent Forms', date: 'Apr 30, 2026', by: 'Dr. Rina Osei', size: '180 KB' },
  { id: 5, name: 'CT Scan — Staging', category: 'Imaging', date: 'May 10, 2026', by: 'Radiology Dept.', size: '8.4 MB' },
  { id: 6, name: 'Pathology Report', category: 'Lab Results', date: 'May 2, 2026', by: 'Dr. Rina Osei', size: '1.2 MB' },
];

const DocIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h9l4 4v16H6z" /><path d="M15 2v4h4M9 13h6M9 17h6" />
  </svg>
);

export default function Documents() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);

  const visibleDocs = activeCategory === 'All' ? docs : docs.filter((d) => d.category === activeCategory);

  const handleUpload = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setDocs((d) => [{ id: Date.now(), name, category: newCategory, date: today, by: 'You', size: '—' }, ...d]);
    setNewName('');
    setNewCategory(CATEGORIES[0]);
    setShowUpload(false);
  };

  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Documents" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 className="gl-greeting">Documents</h1>
              <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginTop: 4 }}>Lab results, imaging, visit summaries, and forms — all in one place.</p>
            </div>
            <button className="gl-pill gl-pill-primary" style={{ border: 'none' }} onClick={() => setShowUpload((s) => !s)}>+ Upload document</button>
          </div>

          {showUpload && (
            <form onSubmit={handleUpload} className="gl-panel" style={{ padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="gl-kicker">New document</span>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  className="gl-input"
                  placeholder="Document name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ flex: 2, minWidth: 200 }}
                  autoFocus
                />
                <select className="gl-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="submit" className="gl-pill gl-pill-primary" style={{ border: 'none' }} disabled={!newName.trim()}>Add</button>
                <button type="button" className="gl-pill" onClick={() => setShowUpload(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="gl-seg" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            {['All', ...CATEGORIES].map((cat) => (
              <span
                key={cat}
                className={`gl-seg-opt${activeCategory === cat ? ' selected' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="gl-panel" style={{ padding: '4px 16px' }}>
            {visibleDocs.length === 0 && (
              <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', padding: '14px 0' }}>No documents in this category yet.</p>
            )}
            {visibleDocs.map((doc, i) => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(34,48,43,.08)' }}>
                <div style={{ width: 36, height: 36, flex: 'none', borderRadius: 10, background: 'rgba(29,122,95,.12)', color: '#1d7a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DocIcon /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)', marginTop: 2 }}>{doc.date} · {doc.by} · {doc.size}</div>
                </div>
                <span className={`gl-tag ${TAG_CLASS[doc.category]}`}>{doc.category}</span>
                <a className="gl-pill" style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }} href="#" aria-label={`View ${doc.name}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
                </a>
                <a className="gl-pill" style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }} href="#" aria-label={`Download ${doc.name}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
