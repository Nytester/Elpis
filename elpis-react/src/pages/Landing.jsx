import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../pages/dashboardGlass.css';

// Simple monochrome line-icon set (24x24, stroke-only) — one glyph per
// feature row, no icon library, so it stays consistent with the rest of the
// hand-drawn inline SVGs already used across the app.
const ICONS = {
  timeline: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  assistant: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v10H9l-4 4v-4H4V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="12" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /></svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="17" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M15.5 12.2c2.5.3 4.5 2.5 4.5 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  pill: (
    <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="10.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 14)" stroke="currentColor" strokeWidth="1.6" /><path d="M9.5 10.5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9.5 12.5h5M9.5 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  lifering: (
    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" /><path d="M6.3 6.3l3.3 3.3M17.7 6.3l-3.3 3.3M6.3 17.7l3.3-3.3M17.7 17.7l-3.3-3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" /></svg>
  ),
};

// A rotating cast of accent hues — one per feature panel, borrowed from tags
// already used elsewhere in the app (mint/gold/purple/sky) — so the seven
// blocks read as distinct sections instead of one repeated template stamped
// seven times. Panels stay glass (blur + translucency); only the tint and
// the accent color of their real UI bits (checkmarks, avatars, dots) rotate.
const ACCENTS = [
  { name: 'mint', solid: '#1d7a5f', wash: 'rgba(29,122,95,.14)' },
  { name: 'gold', solid: '#b5732a', wash: 'rgba(181,115,42,.14)' },
  { name: 'purple', solid: '#7a4fb8', wash: 'rgba(122,79,184,.14)' },
  { name: 'sky', solid: '#3f7ea3', wash: 'rgba(63,126,163,.14)' },
];

// Each feature's preview reuses the *actual* dashboard components it's
// describing (Journey's gl-vtimeline, AiAssistant's gl-msg bubbles,
// CareTeam's gl-avatar, Medications' gl-check, etc.) with generic
// placeholder copy — a real excerpt of the product's own UI language,
// not a stock icon-on-gradient placeholder.
function FeatureVisual({ type, accent }) {
  switch (type) {
    case 'timeline':
      return (
        <div className="gl-vtimeline">
          <div className="gl-vitem gl-stagger-item" style={{ '--i': 0 }}><span className="gl-vdot done" style={{ background: accent.solid, borderColor: accent.solid }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Diagnosis confirmed</div>
          </div>
          <div className="gl-vitem gl-stagger-item" style={{ '--i': 1 }}><span className="gl-vdot current" style={{ background: accent.solid, borderColor: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Treatment in progress</div>
          </div>
          <div className="gl-vitem gl-stagger-item" style={{ '--i': 2 }}><span className="gl-vdot" />
            <div style={{ fontSize: 13, color: 'rgba(34,48,43,.5)' }}>Follow-up scheduled</div>
          </div>
        </div>
      );
    case 'assistant':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 360 }}>
          <div className="gl-msg gl-msg-out gl-stagger-item" style={{ '--i': 0, alignSelf: 'flex-end', background: accent.solid }}>What does this lab result mean?</div>
          <div className="gl-msg gl-msg-in gl-stagger-item" style={{ '--i': 1 }}>Let's walk through it together — I'll flag anything outside your usual range.</div>
        </div>
      );
    case 'people':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          {[['DR', 'Dr. Reyes', 'Oncologist'], ['NP', 'Nadia P.', 'Nurse Navigator'], ['CG', 'You', 'Caregiver']].map(([initials, name, role], i) => (
            <div key={name} className="gl-stagger-item" style={{ '--i': i, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="gl-avatar gl-avatar-lg" style={{ background: accent.solid }}>{initials}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{role}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'pill':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
          <div className="gl-stagger-item" style={{ '--i': 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="gl-check done" style={{ background: accent.solid, borderColor: accent.solid }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span style={{ fontSize: 13 }}>Morning dose logged</span>
          </div>
          <div className="gl-stagger-item" style={{ '--i': 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="gl-check" />
            <span style={{ fontSize: 13, color: 'rgba(34,48,43,.55)' }}>Evening dose</span>
          </div>
          <div className="gl-stagger-item" style={{ '--i': 2, display: 'flex', gap: 6, marginTop: 4 }}>
            {['Mild', 'Moderate', 'Severe'].map((s) => <span key={s} className="gl-tag" style={{ background: accent.wash, color: accent.solid }}>{s}</span>)}
          </div>
        </div>
      );
    case 'document':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
          {['Lab Results', 'Visit Summary', 'Imaging Report'].map((name, i) => (
            <div key={name} className="gl-stagger-item" style={{ '--i': i, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="gl-vicon" style={{ background: accent.wash, color: accent.solid }}>{ICONS.document}</span>
              <span style={{ fontSize: 13 }}>{name}.pdf</span>
            </div>
          ))}
        </div>
      );
    case 'lifering':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 320 }}>
          {['Financial assistance', 'Transportation', 'Telehealth visits', 'Local support groups'].map((s, i) => (
            <span key={s} className="gl-chip gl-stagger-item" style={{ '--i': i, background: accent.wash, borderColor: 'transparent', color: accent.solid }}>{s}</span>
          ))}
        </div>
      );
    case 'pin':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="gl-mini-radar" style={{ '--gl-radar-ring': accent.wash }}>
            <span className="gl-mini-radar-you" />
            <span className="gl-mini-radar-dot gl-stagger-item" style={{ '--i': 0, top: '18%', left: '68%', background: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
            <span className="gl-mini-radar-dot gl-stagger-item" style={{ '--i': 1, top: '58%', left: '26%', background: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
            <span className="gl-mini-radar-dot gl-stagger-item" style={{ '--i': 2, top: '72%', left: '72%', background: accent.solid, boxShadow: `0 0 0 3px ${accent.wash}` }} />
          </div>
          <span className="gl-stagger-item" style={{ '--i': 3, fontSize: 13, color: 'rgba(34,48,43,.6)', lineHeight: 1.5 }}>Nearby hospitals,<br />sorted by distance</span>
        </div>
      );
    default:
      return null;
  }
}

const FEATURES = [
  {
    icon: 'timeline', kicker: 'Timeline', title: 'Journey Timeline',
    body: "A single line through diagnosis, treatment and recovery — see where you've been and what's next.",
    tag: 'Always up to date', tagCls: 'gl-tag',
  },
  {
    icon: 'assistant', kicker: 'Assistant', title: 'AI Assistant',
    body: 'Ask questions about symptoms or appointments any hour, and get answers grounded in your own chart.',
    tag: 'Available 24/7', tagCls: 'gl-tag',
  },
  {
    icon: 'people', kicker: 'People', title: 'Care Team',
    body: 'Oncologists, nurses and caregivers, all reachable in one thread.',
    tag: 'One inbox', tagCls: 'gl-tag-purple',
  },
  {
    icon: 'pill', kicker: 'Tracking', title: 'Medications & Symptoms',
    body: 'Log doses and symptoms in seconds so patterns get caught early.',
    tag: 'Daily use', tagCls: 'gl-tag-purple',
  },
  {
    icon: 'document', kicker: 'Records', title: 'Documents',
    body: 'Lab results, imaging and visit summaries in one place — no more chasing down paperwork between providers.',
    tag: 'Always accessible', tagCls: 'gl-tag-mild',
  },
  {
    icon: 'lifering', kicker: 'Access', title: 'Resources & Support',
    body: 'Financial assistance, transportation and telehealth options.',
    tag: 'Rural & underserved access', tagCls: 'gl-tag-mild',
  },
  {
    icon: 'pin', kicker: 'Locations', title: 'Hospital Finder',
    body: 'Search any zip code to find nearby hospitals and cancer treatment centers, sorted by distance, on an interactive map — no account needed to try it.',
    tag: 'No account needed', tagCls: 'gl-tag-accent',
    link: { to: '/hospital-finder', label: 'Try it now →' },
  },
];

// A sticky-scroll step sequence: the left column lists all 7 features (the
// one nearest the vertical center of the viewport is "active" — full
// opacity, dimmed otherwise), while the right column stays pinned and its
// card morphs to the active step's preview. Hovering a step also activates
// it immediately, so it behaves like a tabbed sequence on top of the
// scroll-driven one. No animation library — an IntersectionObserver on a
// thin horizontal band at the viewport's center drives `active`, and the
// card's own remount (via `key={active}`) triggers its CSS enter animation.
function StickyFeatureSteps() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.idx));
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const activeFeature = FEATURES[active];
  const activeAccent = ACCENTS[active % ACCENTS.length];

  return (
    <div className="gl-steps-wrap">
      <div className="gl-steps-list">
        {FEATURES.map((f, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const isActive = i === active;
          return (
            <div
              key={f.title}
              ref={(el) => { stepRefs.current[i] = el; }}
              data-idx={i}
              className={`gl-step${isActive ? ' active' : ''}`}
              onMouseEnter={() => setActive(i)}
            >
              <div className="gl-feat-heading">
                <span className="gl-feat-glyph" style={{ color: accent.solid }}>{ICONS[f.icon]}</span>
                <span className="gl-step-num" style={isActive ? { color: accent.solid } : undefined}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
              </div>
              <p className="gl-feat-body">{f.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <span className="gl-tag" style={{ background: accent.wash, color: accent.solid }}>{f.tag}</span>
                {f.link && <Link to={f.link.to} style={{ fontSize: 13, color: accent.solid }}>{f.link.label}</Link>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="gl-steps-sticky">
        <div key={active} className="gl-hero-frame gl-feat-visual">
          <FeatureVisual type={activeFeature.icon} accent={activeAccent} />
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="gl-public">
      <div className="gl-hero-scene">
        <Navbar />

        <div className="ep-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 'var(--space-8)', maxWidth: 760 }}>
          <div className="gl-hero-scrim" aria-hidden="true" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="gl-hero-eyebrow">For patients, caregivers &amp; care teams</span>
            <h1 className="gl-hero-title">
              Your care,<br /><em>organized around you.</em>
            </h1>
            <p className="gl-hero-sub">Elpis brings your whole cancer journey into one quiet place — appointments, medications, symptoms and the people caring for you, gathered where you can find them.</p>
            <div className="ep-btnrow" style={{ justifyContent: 'center', marginTop: 'var(--space-5)' }}>
              <Link className="btn btn-primary" to="/register">Get started →</Link>
              <Link className="btn btn-ghost" to="/how-it-works">See how it works →</Link>
            </div>
          </div>
        </div>

        <div className="ep-container" style={{ position: 'relative', zIndex: 1, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
          <div className="gl-hero-frame gl-window-frame">
            <div className="gl-window-bar">
              <span className="gl-window-dot" style={{ background: '#ff5f57' }} />
              <span className="gl-window-dot" style={{ background: '#febc2e' }} />
              <span className="gl-window-dot" style={{ background: '#28c840' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(34,48,43,.55)' }}>Your dashboard, at a glance</span>
            </div>
            <div style={{ aspectRatio: '16/7', background: 'linear-gradient(160deg, #cfe9df 0%, #e8f2ee 60%, #f2f5f3 100%)' }} />
          </div>
        </div>
      </div>

      <div className="ep-container" style={{ position: 'relative', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <div className="gl-blob" style={{ width: 300, height: 300, top: 40, right: '-2%', background: 'radial-gradient(circle, rgba(140,180,210,.4), transparent 70%)', animation: 'gl-float2 16s ease-in-out infinite' }} />
        <div className="gl-blob" style={{ width: 260, height: 260, bottom: -40, left: '10%', background: 'radial-gradient(circle, rgba(126,211,183,.4), transparent 70%)', animation: 'gl-float 14s ease-in-out infinite' }} />
        <h6 style={{ position: 'relative', zIndex: 1, color: 'var(--color-accent-700)' }}>A guide through treatment</h6>
        <h2 style={{ position: 'relative', zIndex: 1, marginTop: 'var(--space-2)', maxWidth: '22ch' }}>Everything care requires, nothing it doesn't.</h2>
        <div style={{ marginTop: 'var(--space-8)' }}>
          <StickyFeatureSteps />
        </div>
      </div>

      <div className="gl-quote-panel" style={{ padding: 'var(--space-8) 0' }}>
        <div className="ep-container" style={{ maxWidth: 760, textAlign: 'center' }}>
          <div className="gl-quote-mark">&ldquo;</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 27, fontWeight: 600, lineHeight: 1.35, margin: '-24px 0 0', color: '#22302b' }}>For the first time since my diagnosis, I didn't feel like I was managing this alone.</p>
          <p className="text-muted" style={{ marginTop: 'var(--space-3)', fontSize: 13 }}>— Elpis patient, in treatment since 2025</p>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ maxWidth: '20ch', marginLeft: 'auto', marginRight: 'auto' }}>Begin with a little more clarity today.</h2>
        <div className="ep-btnrow" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
          <Link className="btn btn-primary" to="/register">Create an account</Link>
          <Link className="btn btn-secondary" to="/contact">Talk to us</Link>
        </div>
      </div>

      <div className="hr ep-container" />
      <Footer />
    </div>
  );
}
