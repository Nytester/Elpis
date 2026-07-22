import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function About() {
  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ maxWidth: 820, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
        <h6 style={{ color: 'var(--color-accent-700)' }}>Why Elpis</h6>
        <h1 style={{ fontSize: 48, fontWeight: 400, marginTop: 'var(--space-2)' }}>Built by people who've stood where you're standing.</h1>
        <p style={{ fontSize: 17, opacity: .85, marginTop: 'var(--space-3)' }}>Elpis started with a diagnosis, a binder full of loose paper, and a family trying to keep track of five doctors who didn't talk to each other — some of them an hour's drive away. We built the tool we wished we'd had — one place that holds the whole picture, and never asks you to explain your story twice, no matter how far you live from the nearest cancer center.</p>
      </div>

      <div className="hr ep-container" />

      <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }}>
          <div className="card elev-sm">
            <span className="card-kicker">Principle 01</span>
            <h4 className="card-title">Clarity over clutter</h4>
            <p className="card-body">Every screen answers one question at a time: what's next, who to ask, what changed. Nothing competes for attention.</p>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Principle 02</span>
            <h4 className="card-title">Always someone reachable</h4>
            <p className="card-body">A message to your care team shouldn't disappear into a portal. Elpis routes it to a person, and tracks the reply.</p>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Principle 03</span>
            <h4 className="card-title">Built with clinicians</h4>
            <p className="card-body">Oncology nurses and patient navigators shaped every workflow here, not just the people who wrote the code.</p>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Principle 04</span>
            <h4 className="card-title">Built for every community</h4>
            <p className="card-body">Cancer doesn't wait for you to live near a specialist. Elpis brings telehealth, transportation help and financial support into the same place as your care team — built with rural and underserved communities in mind.</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: 'var(--space-8) 0' }}>
        <div className="ep-container" style={{ maxWidth: 820, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 26, fontWeight: 400, lineHeight: 1.3, margin: 0 }}>"We didn't want to build another dashboard. We wanted to build the calm in the middle of the storm."</p>
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
    </>
  );
}
