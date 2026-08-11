import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../pages/dashboardGlass.css';

const FEATURES = [
  {
    span: 2, kicker: 'Timeline', title: 'Journey Timeline',
    body: "A single line through diagnosis, treatment and recovery — see where you've been and what's next.",
    tag: 'Always up to date', tagCls: 'gl-tag',
  },
  {
    span: 2, kicker: 'Assistant', title: 'AI Assistant',
    body: 'Ask questions about symptoms or appointments any hour, and get answers grounded in your own chart.',
    tag: 'Available 24/7', tagCls: 'gl-tag',
  },
  {
    span: 1, kicker: 'People', title: 'Care Team',
    body: 'Oncologists, nurses and caregivers, all reachable in one thread.',
    tag: 'One inbox', tagCls: 'gl-tag-purple',
  },
  {
    span: 1, kicker: 'Tracking', title: 'Medications & Symptoms',
    body: 'Log doses and symptoms in seconds so patterns get caught early.',
    tag: 'Daily use', tagCls: 'gl-tag-purple',
  },
  {
    span: 2, kicker: 'Records', title: 'Documents',
    body: 'Lab results, imaging and visit summaries in one place — no more chasing down paperwork between providers.',
    tag: 'Always accessible', tagCls: 'gl-tag-mild',
  },
  {
    span: 1, kicker: 'Access', title: 'Resources & Support',
    body: 'Financial assistance, transportation and telehealth options.',
    tag: 'Rural & underserved access', tagCls: 'gl-tag-mild',
  },
  {
    span: 3, kicker: 'Locations', title: 'Hospital Finder',
    body: 'Search any zip code to find nearby hospitals and cancer treatment centers, sorted by distance, on an interactive map — no account needed to try it.',
    tag: 'No account needed', tagCls: 'gl-tag-accent',
    link: { to: '/hospital-finder', label: 'Try it now →' },
  },
];

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
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="gl-bento" style={{ gridColumn: `span ${f.span}` }}>
              <span className="gl-kicker">{f.kicker}</span>
              <h4 className="card-title">{f.title}</h4>
              <p className="card-body" style={{ flex: 1 }}>{f.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`gl-tag ${f.tagCls}`}>{f.tag}</span>
                {f.link && <Link to={f.link.to} style={{ fontSize: 13, color: '#1d7a5f' }}>{f.link.label}</Link>}
              </div>
            </div>
          ))}
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
