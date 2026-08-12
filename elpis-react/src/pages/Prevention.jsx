import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import './dashboardGlass.css';

const WARNING_SIGNS = [
  { title: 'Unexplained fatigue', desc: "Extreme tiredness that doesn't improve with rest." },
  { title: 'Unexplained weight change', desc: 'Losing or gaining 10+ pounds without trying.' },
  { title: 'Persistent pain', desc: "Pain anywhere in the body that doesn't go away or gets worse." },
  { title: 'Skin changes', desc: 'A new mole, a change in an existing one, or a sore that won’t heal.' },
  { title: 'Changes in bowel or bladder habits', desc: 'Ongoing constipation, diarrhea, or urinary changes.' },
  { title: 'Unusual bleeding', desc: 'Bleeding or discharge that’s new or unexplained.' },
];

const SCREENINGS = [
  { title: 'Breast', desc: 'Mammograms starting at 40–44 (by choice), annually from 45, every 1–2 years from 55.', href: 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-recommendations-for-the-early-detection-of-breast-cancer.html' },
  { title: 'Colorectal', desc: 'Regular screening starting at 45 for average-risk adults — colonoscopy or a stool-based test.', href: 'https://www.cancer.org/cancer/screening/american-cancer-society-guidelines-for-the-early-detection-of-cancer.html' },
  { title: 'Cervical', desc: 'Pap and/or HPV testing on a regular schedule starting at 25.', href: 'https://www.cancer.org/cancer/types/cervical-cancer/detection-diagnosis-staging/cervical-cancer-screening-guidelines.html' },
  { title: 'By age', desc: 'See the full set of ACS-recommended screenings organized by age and sex.', href: 'https://www.cancer.org/cancer/screening/screening-recommendations-by-age.html' },
];

const RISK_FACTORS = [
  { title: 'Age & family history', desc: 'Risk rises with age; a family history of certain cancers can raise personal risk.' },
  { title: 'Tobacco & alcohol use', desc: 'Two of the most preventable, well-established risk factors.' },
  { title: 'Diet & physical activity', desc: 'Diet, weight, and activity level all influence long-term risk.' },
  { title: 'Environmental & occupational exposure', desc: 'Certain chemicals, radiation, and workplace exposures increase risk.' },
];

// Real, widely-cited public-health figures (American Cancer Society / National
// Cancer Institute) — the same organizations already linked throughout this
// page — used as stat callouts. No invented numbers.
const STATS = [
  { stat: '1 in 2', label: 'men, and roughly 1 in 3 women in the U.S., will be diagnosed with cancer in their lifetime.', source: 'American Cancer Society' },
  { stat: '40%+', label: 'of cancer cases are linked to preventable risk factors — tobacco, alcohol, diet and inactivity among them.', source: 'American Cancer Society' },
  { stat: 'Earlier', label: 'detection through regular screening consistently improves outcomes and treatment options.', source: 'National Cancer Institute' },
];

export default function Prevention() {
  return (
    <div className="gl-public">
      <Navbar />

      {/* Hero — centered, single CTA, no photo (ambient blobs carry the
          atmosphere instead), mirroring notion.com/enterprise's centered
          hero-then-scroll structure. */}
      <div className="ep-container" style={{ position: 'relative', maxWidth: 720, textAlign: 'center', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
        <div className="gl-blob" style={{ width: 340, height: 340, top: -100, left: '50%', marginLeft: -170, background: 'radial-gradient(circle, rgba(126,211,183,.45), transparent 70%)', animation: 'gl-float 15s ease-in-out infinite' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="gl-hero-eyebrow">Cancer Care &amp; Prevention</span>
          <h1 className="gl-hero-title" style={{ fontSize: 46 }}>Awareness <em>saves lives.</em></h1>
          <p className="gl-hero-sub" style={{ margin: 'var(--space-4) auto 0' }}>
            Screening and early detection meaningfully improve outcomes, especially in rural and underserved communities where access to specialists is limited. This page is here for anyone — patients, caregivers, or family members — who wants to understand the basics before a diagnosis ever happens.
          </p>
          <div className="ep-btnrow" style={{ justifyContent: 'center', marginTop: 'var(--space-5)' }}>
            <a className="btn btn-primary" href="#signs">See the warning signs ↓</a>
          </div>
        </div>
      </div>

      <div className="ep-container" style={{ paddingBottom: 'var(--space-6)' }}>
        <div className="gl-hero-frame" style={{ maxWidth: 820, margin: '0 auto', padding: 'var(--space-5) var(--space-6)' }}>
          <p style={{ fontSize: 13, margin: 0 }}>
            <strong>This page is for general education only</strong> and is not a substitute for professional medical advice, diagnosis, or treatment. Always talk to a healthcare provider about your personal risk and screening schedule.
          </p>
        </div>
      </div>

      {/* Stat callouts — notion.com/enterprise's three-stat row, adapted to
          real, sourced public-health figures instead of usage metrics. */}
      <div className="ep-container" style={{ paddingBottom: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-6)' }}>
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, color: '#1d7a5f', lineHeight: 1 }}>{s.stat}</div>
              <p style={{ fontSize: 14, marginTop: 8, color: 'rgba(34,48,43,.72)', lineHeight: 1.5 }}>{s.label}</p>
              <span className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.source}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alternating feature blocks — the notion.com/enterprise device of
          left-aligned copy paired with a visual, flipping sides each time.
          Each visual reuses a REAL component from the actual dashboard
          (the calendar from Dashboard.jsx, chips from Resources) so it
          illustrates the real product, not stock art. */}
      <div id="signs" className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)', scrollMarginTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div>
            <span className="gl-kicker">Know the signs</span>
            <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '22ch' }}>Common warning signs worth mentioning to a doctor</h2>
            <p style={{ fontSize: 15, color: 'rgba(34,48,43,.72)', marginTop: 'var(--space-3)', maxWidth: '46ch' }}>None of these mean cancer on their own — but they're worth a conversation with a doctor, especially if they're new or don't go away.</p>
            <a href="https://www.cancer.org/cancer/diagnosis-staging/signs-and-symptoms-of-cancer.html" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 'var(--space-4)', fontSize: 13, color: '#1d7a5f' }}>Read the full list at the American Cancer Society →</a>
          </div>
          <div className="gl-hero-frame" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {WARNING_SIGNS.slice(0, 4).map((s) => (
                <div key={s.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c1584a', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 12.5, color: 'rgba(34,48,43,.6)', marginTop: 1 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div className="gl-hero-frame" style={{ padding: 'var(--space-6)', order: 0 }}>
            <span className="gl-kicker">This week</span>
            <div className="gl-cal" style={{ marginTop: 10 }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="hd">{d}</span>)}
              {[6, 7, 8, 9, 10, 11, 12].map((d) => (
                <span key={d} className={`gl-day${d === 10 ? ' today' : ''}`}>{d}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12.5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d7a5f' }} />
              Screening reminder
            </div>
          </div>
          <div>
            <span className="gl-kicker">Get screened</span>
            <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '22ch' }}>General screening guidelines</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'var(--space-4)' }}>
              {SCREENINGS.map((s) => (
                <div key={s.title}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</span>
                  <span style={{ fontSize: 13.5, color: 'rgba(34,48,43,.65)' }}> — {s.desc} </span>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1d7a5f', whiteSpace: 'nowrap' }}>ACS guidelines →</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div>
            <span className="gl-kicker">Know your risk</span>
            <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '22ch' }}>Common risk factors</h2>
            <p style={{ fontSize: 15, color: 'rgba(34,48,43,.72)', marginTop: 'var(--space-3)', maxWidth: '46ch' }}>Some factors, like age and family history, can't be changed — others, like tobacco use and physical activity, can.</p>
            <a href="https://www.cancer.gov/about-cancer/causes-prevention/risk" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 'var(--space-4)', fontSize: 13, color: '#1d7a5f' }}>Read more at the National Cancer Institute →</a>
          </div>
          <div className="gl-hero-frame" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {RISK_FACTORS.map((r) => (
                <span key={r.title} className="gl-chip" style={{ cursor: 'default' }} title={r.desc}>{r.title}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "When to act" — the notion.com/enterprise compliance-grid device
          (three text-only columns under category headers), repurposed as a
          quick-reference summary of everything above. */}
      <div className="gl-quote-panel" style={{ padding: 'var(--space-8) 0' }}>
        <div className="ep-container">
          <h6 style={{ textAlign: 'center', color: 'var(--color-accent-700)' }}>Quick reference</h6>
          <h2 style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>When to act</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            <div>
              <h4 className="card-title" style={{ fontSize: 15 }}>Talk to a doctor about</h4>
              <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {WARNING_SIGNS.slice(0, 4).map((s) => <li key={s.title} style={{ fontSize: 13.5 }}>{s.title}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="card-title" style={{ fontSize: 15 }}>Schedule regular screening for</h4>
              <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SCREENINGS.slice(0, 3).map((s) => <li key={s.title} style={{ fontSize: 13.5 }}>{s.title} cancer</li>)}
              </ul>
            </div>
            <div>
              <h4 className="card-title" style={{ fontSize: 15 }}>Manage what you can</h4>
              <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {RISK_FACTORS.map((r) => <li key={r.title} style={{ fontSize: 13.5 }}>{r.title}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ maxWidth: '26ch', marginLeft: 'auto', marginRight: 'auto' }}>Already navigating a diagnosis?</h2>
        <p className="text-muted" style={{ maxWidth: '40ch', margin: 'var(--space-2) auto 0' }}>Elpis helps you track appointments, medications, symptoms, and stay connected with your care team.</p>
        <div className="ep-btnrow" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
          <Link className="btn btn-primary" to="/register">Create an account</Link>
          <Link className="btn btn-secondary" to="/about">Learn about Elpis</Link>
        </div>
      </div>

      <div className="hr ep-container" />
      <Footer />
    </div>
  );
}
