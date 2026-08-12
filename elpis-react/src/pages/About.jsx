import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import './dashboardGlass.css';

const PRINCIPLES = [
  {
    kicker: 'Principle 01', title: 'Clarity over clutter',
    body: "Every screen answers one question at a time: what's next, who to ask, what changed. Nothing competes for attention.",
  },
  {
    kicker: 'Principle 02', title: 'Always someone reachable',
    body: "A message to your care team shouldn't disappear into a portal. Elpis routes it to a person, and tracks the reply.",
  },
  {
    kicker: 'Principle 03', title: 'Built with clinicians',
    body: 'Oncology nurses and patient navigators shaped every workflow here, not just the people who wrote the code.',
  },
  {
    kicker: 'Principle 04', title: 'Built for every community',
    body: 'Cancer doesn\'t wait for you to live near a specialist. Elpis brings telehealth, transportation help and financial support into the same place as your care team — built with rural and underserved communities in mind.',
  },
];

export default function About() {
  return (
    <div className="gl-public">
      <Navbar />

      <div className="ep-container" style={{ position: 'relative', maxWidth: 820, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
        <div className="gl-blob" style={{ width: 360, height: 360, top: -90, right: '-6%', background: 'radial-gradient(circle, rgba(126,211,183,.5), transparent 70%)', animation: 'gl-float 14s ease-in-out infinite' }} />
        <div className="gl-blob" style={{ width: 260, height: 260, top: 160, left: '-8%', background: 'radial-gradient(circle, rgba(140,180,210,.45), transparent 70%)', animation: 'gl-float2 17s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="gl-hero-eyebrow">Why Elpis</span>
          <h1 className="gl-hero-title" style={{ fontSize: 46, marginTop: 'var(--space-4)', maxWidth: '20ch' }}>Built by people who&apos;ve stood where you&apos;re standing.</h1>
          <p style={{ fontSize: 17, color: 'rgba(22,33,29,.75)', marginTop: 'var(--space-4)', maxWidth: '62ch' }}>Elpis started with a diagnosis, a binder full of loose paper, and a family trying to keep track of five doctors who didn&apos;t talk to each other — some of them an hour&apos;s drive away. We built the tool we wished we&apos;d had — one place that holds the whole picture, and never asks you to explain your story twice, no matter how far you live from the nearest cancer center.</p>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }}>
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="gl-bento">
              <span className="gl-kicker">{p.kicker}</span>
              <h4 className="card-title">{p.title}</h4>
              <p className="card-body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="gl-quote-panel" style={{ padding: 'var(--space-8) 0' }}>
        <div className="ep-container" style={{ maxWidth: 760, textAlign: 'center' }}>
          <div className="gl-quote-mark">&ldquo;</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 27, fontWeight: 600, lineHeight: 1.35, margin: '-24px 0 0', color: '#22302b' }}>We didn&apos;t want to build another dashboard. We wanted to build the calm in the middle of the storm.</p>
          <p className="text-muted" style={{ marginTop: 'var(--space-3)', fontSize: 13 }}>— Elpis founding team</p>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ maxWidth: '20ch', marginLeft: 'auto', marginRight: 'auto' }}>Begin with a little more clarity today.</h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
          <Link className="btn btn-primary" to="/register">Create an account</Link>
          <Link className="btn btn-secondary" to="/contact">Talk to us</Link>
        </div>
      </div>

      <div className="hr ep-container" />
      <Footer />
    </div>
  );
}
