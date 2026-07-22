import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

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

export default function Prevention() {
  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ maxWidth: 820, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
        <h6 style={{ color: 'var(--color-accent-700)' }}>Cancer Care &amp; Prevention</h6>
        <h1 style={{ fontSize: 48, fontWeight: 400, marginTop: 'var(--space-2)' }}>Awareness saves lives.</h1>
        <p style={{ fontSize: 17, opacity: .85, marginTop: 'var(--space-3)' }}>Screening and early detection meaningfully improve outcomes, especially in rural and underserved communities where access to specialists is limited. This page is here for anyone — patients, caregivers, or family members — who wants to understand the basics before a diagnosis ever happens.</p>
      </div>

      <div className="ep-container" style={{ paddingBottom: 'var(--space-6)' }}>
        <div className="card elev-sm" style={{ borderColor: 'var(--color-accent)', maxWidth: 820 }}>
          <p className="card-body" style={{ fontSize: 13 }}>
            <strong>This page is for general education only</strong> and is not a substitute for professional medical advice, diagnosis, or treatment. Always talk to a healthcare provider about your personal risk and screening schedule.
          </p>
        </div>
      </div>

      <div className="hr ep-container" />

      <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-2)' }}>
        <h6 style={{ color: 'var(--color-accent-700)' }}>Know the signs</h6>
        <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '26ch' }}>Common warning signs worth mentioning to a doctor</h2>
      </div>
      <div className="ep-container" style={{ paddingBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
          {WARNING_SIGNS.map((s) => (
            <div key={s.title} className="card elev-sm">
              <h4 className="card-title">{s.title}</h4>
              <p className="card-body">{s.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 'var(--space-4)' }}>
          <a href="https://www.cancer.org/cancer/diagnosis-staging/signs-and-symptoms-of-cancer.html" target="_blank" rel="noopener noreferrer">Read the full list at the American Cancer Society →</a>
        </p>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: 'var(--space-8) 0' }}>
        <div className="ep-container">
          <h6 style={{ color: 'var(--color-accent-700)' }}>Get screened</h6>
          <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '26ch' }}>General screening guidelines</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            {SCREENINGS.map((s) => (
              <div key={s.title} className="card elev-sm" style={{ background: 'var(--color-bg)' }}>
                <span className="card-kicker">{s.title}</span>
                <p className="card-body" style={{ marginTop: 4 }}>{s.desc}</p>
                <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>ACS guidelines →</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-2)' }}>
        <h6 style={{ color: 'var(--color-accent-700)' }}>Know your risk</h6>
        <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '26ch' }}>Common risk factors</h2>
      </div>
      <div className="ep-container" style={{ paddingBottom: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)' }}>
          {RISK_FACTORS.map((r) => (
            <div key={r.title} className="card elev-sm">
              <h4 className="card-title" style={{ fontSize: 16 }}>{r.title}</h4>
              <p className="card-body">{r.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 'var(--space-4)' }}>
          <a href="https://www.cancer.gov/about-cancer/causes-prevention/risk" target="_blank" rel="noopener noreferrer">Read more at the National Cancer Institute →</a>
        </p>
      </div>

      <div className="hr ep-container" />

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
    </>
  );
}
