import { useState } from 'react';

// Shared layout for legal pages (Privacy Policy, Terms of Service) — styled
// to match the rest of the marketing site (hero eyebrow/title, floating
// blobs like About.jsx) instead of a bare wall of text: a sticky side-nav
// of section chips next to glass gl-bento cards, one per section.
export default function LegalPage({ eyebrow, title, intro, updated, sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.title);

  return (
    <>
      <div className="ep-container" style={{ position: 'relative', maxWidth: 820, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-4)' }}>
        <div className="gl-blob" style={{ width: 320, height: 320, top: -80, right: '-6%', background: 'radial-gradient(circle, rgba(126,211,183,.45), transparent 70%)', animation: 'gl-float 15s ease-in-out infinite' }} />
        <div className="gl-blob" style={{ width: 240, height: 240, top: 140, left: '-8%', background: 'radial-gradient(circle, rgba(140,180,210,.4), transparent 70%)', animation: 'gl-float2 17s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="gl-hero-eyebrow">{eyebrow}</span>
          <h1 className="gl-hero-title" style={{ fontSize: 44, marginTop: 'var(--space-3)' }}>{title}</h1>
          <p style={{ fontSize: 16, color: 'rgba(22,33,29,.75)', marginTop: 'var(--space-3)', maxWidth: '58ch' }}>{intro}</p>
          {updated && <span className="gl-tag" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>Last updated {updated}</span>}
        </div>
      </div>

      <div className="ep-container" style={{ maxWidth: 1000, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        <div className="gl-legal-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          <nav className="gl-legal-nav" aria-label="Sections">
            {sections.map((s) => (
              <a
                key={s.title}
                href={`#${slug(s.title)}`}
                className={`gl-legal-navlink${activeId === s.title ? ' active' : ''}`}
                onClick={() => setActiveId(s.title)}
              >
                {s.title}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {sections.map((s, i) => (
              <div id={slug(s.title)} key={s.title} className="gl-bento" style={{ scrollMarginTop: 90 }}>
                <span className="gl-kicker">Section {String(i + 1).padStart(2, '0')}</span>
                <h4 className="card-title" style={{ marginTop: 4 }}>{s.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {s.body.map((line, j) => (
                    <p key={j} className="card-body" style={{ margin: 0 }}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
