import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';

const CATEGORIES = ['Lab Results', 'Imaging', 'Visit Summaries', 'Insurance & Billing', 'Consent Forms'];

const TAG_CLASS = {
  'Lab Results': 'tag-accent',
  'Imaging': 'tag-accent-2',
  'Visit Summaries': 'tag-outline',
  'Insurance & Billing': 'tag-neutral',
  'Consent Forms': 'tag-neutral',
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
    <div className="ep-shell-dash">
      <Sidebar active="Documents" />

      <div className="ep-main">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 400 }}>Documents</h1>
            <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Lab results, imaging, visit summaries, and forms — all in one place.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowUpload((s) => !s)}>+ Upload document</button>
        </div>

        {showUpload && (
          <form onSubmit={handleUpload} className="card elev-sm" style={{ marginBottom: 'var(--space-4)', gap: 'var(--space-3)' }}>
            <span className="card-kicker">New document</span>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <input
                className="input"
                placeholder="Document name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 2, minWidth: 200 }}
                autoFocus
              />
              <select className="input" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="submit" className="btn btn-primary" disabled={!newName.trim()}>Add</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="seg" style={{ marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES].map((cat) => (
            <span
              key={cat}
              className={`seg-opt${activeCategory === cat ? ' selected' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
          {visibleDocs.length === 0 && (
            <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>No documents in this category yet.</p>
          )}
          {visibleDocs.map((doc) => (
            <div key={doc.id} className="ep-doc-row">
              <div className="ep-doc-icon"><DocIcon /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14 }}>{doc.name}</div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{doc.date} · {doc.by} · {doc.size}</div>
              </div>
              <span className={`tag ${TAG_CLASS[doc.category]}`}>{doc.category}</span>
              <a className="btn btn-icon btn-ghost" href="#" aria-label={`View ${doc.name}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
              </a>
              <a className="btn btn-icon btn-ghost" href="#" aria-label={`Download ${doc.name}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
