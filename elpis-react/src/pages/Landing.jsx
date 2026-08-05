import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'var(--space-8)', alignItems: 'center', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <div>
          <h6 style={{ color: 'var(--color-accent-700)' }}>For patients, caregivers &amp; care teams</h6>
          <h1 style={{ fontSize: 56, fontWeight: 400, marginTop: 'var(--space-2)' }}>Hope, organized around you.</h1>
          <p style={{ fontSize: 17, maxWidth: '46ch', opacity: .85, marginTop: 'var(--space-3)' }}>Elpis brings your whole cancer journey into one quiet place — appointments, medications, symptoms and the people caring for you, gathered where you can find them, whether your care team is down the hall or an hour away.</p>
          <div className="ep-btnrow" style={{ marginTop: 'var(--space-4)' }}>
            <Link className="btn btn-primary" to="/register">Get started</Link>
            <Link className="btn btn-ghost" to="/how-it-works">See how it works ›</Link>
          </div>
        </div>
        <figure className="plate" style={{ margin: 0 }}>
          <div style={{ width: '100%', height: 360, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-500)', fontSize: 13 }}>
            Patient portal preview
          </div>
        </figure>
      </div>

      <div className="hr ep-container" />

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <h6 style={{ color: 'var(--color-accent-700)' }}>A guide through treatment</h6>
        <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '22ch' }}>Everything care requires, nothing it doesn't.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          <div className="card elev-sm">
            <span className="card-kicker">Timeline</span>
            <h4 className="card-title">Journey Timeline</h4>
            <p className="card-body">A single line through diagnosis, treatment and recovery — see where you've been and what's next.</p>
            <span className="tag tag-accent">Always up to date</span>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Assistant</span>
            <h4 className="card-title">AI Assistant</h4>
            <p className="card-body">Ask questions about symptoms or appointments any hour, and get answers grounded in your own chart.</p>
            <span className="tag tag-accent">Available 24/7</span>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">People</span>
            <h4 className="card-title">Care Team</h4>
            <p className="card-body">Oncologists, nurses and caregivers, all reachable in one thread — no more calling five numbers.</p>
            <span className="tag tag-accent-2">One inbox</span>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Tracking</span>
            <h4 className="card-title">Medications &amp; Symptoms</h4>
            <p className="card-body">Log doses and symptoms in seconds, so your care team catches patterns before they become emergencies.</p>
            <span className="tag tag-accent-2">Built for daily use</span>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Records</span>
            <h4 className="card-title">Documents</h4>
            <p className="card-body">Lab results, imaging and visit summaries in one place — no more chasing down paperwork between providers.</p>
            <span className="tag tag-neutral">Always accessible</span>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Access</span>
            <h4 className="card-title">Resources &amp; Support</h4>
            <p className="card-body">Financial assistance, transportation programs and telehealth options — because care shouldn't stop at the parking lot.</p>
            <span className="tag tag-neutral">Built for rural &amp; underserved access</span>
          </div>
          <div className="card elev-sm">
            <span className="card-kicker">Locations</span>
            <h4 className="card-title">Hospital Finder</h4>
            <p className="card-body">Search any zip code to find nearby hospitals and cancer treatment centers, sorted by distance, on an interactive map.</p>
            <span className="tag tag-accent">No account needed</span>
            <Link to="/hospital-finder" style={{ fontSize: 13, marginTop: 'var(--space-1)' }}>Try it now →</Link>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: 'var(--space-8) 0' }}>
        <div className="ep-container" style={{ maxWidth: 820, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 26, fontWeight: 400, lineHeight: 1.3, margin: 0 }}>"For the first time since my diagnosis, I didn't feel like I was managing this alone."</p>
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
    </>
  );
}
