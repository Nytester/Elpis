import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function FeatureSection({ id, kicker, title, description, points, reverse }) {
  return (
    <div id={id} className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', scrollMarginTop: 90 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center', direction: reverse ? 'rtl' : 'ltr' }}>
        <div style={{ direction: 'ltr' }}>
          <h6 style={{ color: 'var(--color-accent-700)' }}>{kicker}</h6>
          <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '18ch' }}>{title}</h2>
          <p style={{ fontSize: 16, opacity: .8, marginTop: 'var(--space-3)', maxWidth: '48ch' }}>{description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            {points.map((p) => (
              <div key={p.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ flex: 'none', marginTop: 3 }}>
                  <circle cx="8" cy="8" r="7.25" stroke="var(--color-accent)" strokeWidth="1.3" />
                  <path d="M5 8.2l2 2 4-4.4" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{p.title}</div>
                  <div className="text-muted" style={{ fontSize: 13.5, marginTop: 2 }}>{p.body}</div>
                </div>
              </div>
            ))}
          </div>
          <Link className="btn btn-primary" to="/register" style={{ marginTop: 'var(--space-5)' }}>Create a free account</Link>
        </div>
        <figure className="plate" style={{ margin: 0, direction: 'ltr' }}>
          <div style={{ width: '100%', height: 320, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-500)', fontSize: 13 }}>
            {title} preview
          </div>
        </figure>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ maxWidth: 680, textAlign: 'center', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-4)' }}>
        <span className="tag tag-outline">How it works</span>
        <h1 style={{ fontSize: 48, fontWeight: 400, marginTop: 'var(--space-3)', lineHeight: 1.08 }}>What you actually get with Elpis.</h1>
        <p style={{ fontSize: 17, opacity: .8, marginTop: 'var(--space-3)', maxWidth: '52ch', marginLeft: 'auto', marginRight: 'auto' }}>
          A quick look at the two things people ask about most — the patient dashboard, and the AI Assistant. Sign in isn't required to read this page.
        </p>
      </div>

      <div className="hr ep-container" />

      <FeatureSection
        id="dashboard"
        kicker="Product"
        title="One dashboard for the whole journey."
        description="Instead of switching between a portal for appointments, a folder for records, and your phone for messaging your care team, everything lives on one screen — organized around where you actually are in treatment."
        points={[
          { title: 'Journey Timeline', body: 'See your care path from diagnosis through survivorship, and exactly where you are on it today.' },
          { title: 'Symptoms & medications', body: "Log how you're feeling in seconds — anything severe reaches your care team in real time, not at your next appointment." },
          { title: 'Care team, one thread', body: 'Message your oncologist, nurse navigator, and caregivers without hunting for five different phone numbers.' },
          { title: 'Documents & insurance', body: 'Records, insurance cards, EOBs and prior-authorization status, all in one place instead of a folder of paperwork.' },
        ]}
      />

      <div className="hr ep-container" />

      <FeatureSection
        id="ai-assistant"
        kicker="Product"
        title="Ask, instead of searching."
        description="The AI Assistant answers questions about your own care — medications, appointments, symptoms, what's next — grounded in your chart, so you're not digging back through old messages or waiting for a callback for a simple question."
        reverse
        points={[
          { title: "Grounded in your chart", body: "Answers reference your actual medications, appointments, and recent symptom logs — not generic information." },
          { title: 'Available any hour', body: "Ask at 2am if you're wondering whether nausea is expected after a cycle — you don't have to wait for office hours." },
          { title: 'Knows when to hand off', body: "For anything it can't answer, it points you to your care team or the Resources page instead of guessing." },
        ]}
      />

      <div className="hr ep-container" />

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ maxWidth: '20ch', marginLeft: 'auto', marginRight: 'auto' }}>See it on your own care, not a demo account.</h2>
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
