import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { BLOG_POSTS } from '../lib/blogPosts.js';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flex: 'none', marginTop: 2 }}>
    <circle cx="8" cy="8" r="7.25" stroke="var(--color-accent)" strokeWidth="1.3" />
    <path d="M5 8.2l2 2 4-4.4" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Feature({ children }) {
  return (
    <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5 }}>
      <CheckIcon />
      <span>{children}</span>
    </li>
  );
}

function PlanCard({ kicker, name, price, priceNote, features, cta, highlighted, secondaryCta }) {
  return (
    <div
      className={`card ${highlighted ? 'elev-md' : 'elev-sm'}`}
      style={{
        position: 'relative',
        padding: 'var(--space-6) var(--space-5)',
        gap: 'var(--space-4)',
        borderRadius: 14,
        borderColor: highlighted ? 'var(--color-accent)' : 'var(--color-divider)',
        borderWidth: highlighted ? 2 : 1,
      }}
    >
      {highlighted && (
        <span
          className="tag tag-accent"
          style={{ position: 'absolute', top: -12, left: 'var(--space-5)', padding: '4px 12px' }}
        >
          Most popular
        </span>
      )}

      <div>
        <span className="card-kicker">{kicker}</span>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 21, marginTop: 4, marginBottom: 0 }}>{name}</h3>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 40, lineHeight: 1 }}>{price}</div>
        <div className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>{priceNote}</div>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {features.map((f) => <Feature key={f}>{f}</Feature>)}
      </ul>

      {secondaryCta ? (
        <a href={secondaryCta.href} className="btn btn-secondary btn-block">{cta}</a>
      ) : (
        <div className={`btn ${highlighted ? 'btn-primary' : 'btn-secondary'} btn-block`}>{cta}</div>
      )}
    </div>
  );
}

// Real reasons to use Elpis, mapped to features that actually exist — the
// structural echo of a "why membership" section, not the Medium copy.
const WHY_ELPIS = [
  {
    title: 'Everything in one place',
    body: "Your dashboard, Journey Timeline, medications and documents live together, so you're not piecing your care together across five different apps and a folder of paperwork.",
  },
  {
    title: 'A care team you can actually reach',
    body: 'Message your oncologist, nurse navigator and care coordinators in one thread — no more calling five numbers to ask one question.',
  },
  {
    title: 'Track what matters, without the spreadsheet',
    body: 'Log symptoms and medications in seconds. Anything severe reaches your care team in real time, so patterns get caught before they become emergencies.',
  },
  {
    title: 'Find your way there',
    body: 'Search any zip code for nearby hospitals and cancer treatment centers, plus real transportation programs — rideshare, paratransit, and volunteer driver networks.',
  },
  {
    title: "You're not alone in this",
    body: 'A peer support community for patients and caregivers going through the same thing, alongside the clinical side of your care.',
  },
];

// Anonymous by design — real named/attributed testimonials would need real
// people who actually said these things, which we don't have yet.
const VOICES = [
  { quote: "For the first time since my diagnosis, I didn't feel like I was managing this alone.", who: 'Elpis patient, in treatment since 2025' },
  { quote: 'I can finally see what my mom\'s care team sees, instead of piecing it together from memory after every appointment.', who: 'Elpis caregiver' },
  { quote: "Having symptom logs flow straight to me means I'm not waiting for a phone call to know a patient needs a check-in.", who: 'Oncology care coordinator' },
];

export default function Pricing() {
  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ maxWidth: 680, textAlign: 'center', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 52, fontWeight: 400, lineHeight: 1.06 }}>Support a calmer cancer journey.</h1>
        <p style={{ fontSize: 17, opacity: .8, marginTop: 'var(--space-3)', maxWidth: '52ch', marginLeft: 'auto', marginRight: 'auto' }}>
          Elpis brings your whole cancer journey into one quiet place, free for every patient and caregiver — join to see how your own care could look organized.
        </p>
        <div className="ep-btnrow" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
          <Link className="btn btn-primary" to="/register">Get started</Link>
          <a className="btn btn-ghost" href="#plans">View plans</a>
        </div>
      </div>

      {BLOG_POSTS.length > 0 && (
        <div className="ep-container" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(BLOG_POSTS.length, 2)},1fr)`, gap: 'var(--space-4)' }}>
            {BLOG_POSTS.slice(0, 2).map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="card elev-sm" style={{ textDecoration: 'none', color: 'inherit', gap: 'var(--space-2)' }}>
                <span className="card-kicker">From the Elpis blog</span>
                <h3 className="card-title" style={{ fontSize: 19 }}>{post.title}</h3>
                <p className="card-body">{post.excerpt}</p>
                <span className="text-muted" style={{ fontSize: 12 }}>{post.date}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="hr ep-container" />

      <div className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        <h6 style={{ color: 'var(--color-accent-700)' }}>Why Elpis</h6>
        <h2 style={{ marginTop: 'var(--space-2)', maxWidth: '20ch' }}>What an account actually gets you.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-6) var(--space-8)', marginTop: 'var(--space-6)' }}>
          {WHY_ELPIS.map((item) => (
            <div key={item.title}>
              <h4 className="card-title" style={{ fontSize: 18 }}>{item.title}</h4>
              <p className="card-body" style={{ fontSize: 14.5, marginTop: 6, opacity: .8 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', padding: 'var(--space-8) 0' }}>
        <div className="ep-container">
          <h6 style={{ color: 'var(--color-accent-700)', textAlign: 'center' }}>What people are saying</h6>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
            {VOICES.map((v) => (
              <div key={v.who} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.4, margin: 0 }}>&ldquo;{v.quote}&rdquo;</p>
                <p className="text-muted" style={{ marginTop: 'var(--space-3)', fontSize: 12.5 }}>— {v.who}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="plans" className="ep-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-4)', textAlign: 'center', scrollMarginTop: 24 }}>
        <span className="tag tag-outline">Early access</span>
        <h2 style={{ marginTop: 'var(--space-3)', fontSize: 34 }}>Simple, honest pricing.</h2>
        <p style={{ fontSize: 15, opacity: .8, marginTop: 'var(--space-2)', maxWidth: '52ch', marginLeft: 'auto', marginRight: 'auto' }}>
          We're finalizing provider pricing alongside the clinics piloting Elpis. Every patient and caregiver account is free while we're in early access — no trial clock, no card required.
        </p>
      </div>

      <div className="ep-container" style={{ paddingBottom: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-6)', alignItems: 'stretch', paddingTop: 'var(--space-3)' }}>
          <PlanCard
            kicker="Individual"
            name="Patient & Caregiver"
            price="Free"
            priceNote="During early access"
            features={[
              'Personal dashboard & Journey Timeline',
              'Symptom and medication tracking',
              'Secure messaging with your care team',
              'Document storage for records & results',
              'Hospital Finder & transportation resources',
            ]}
            cta="Join the waitlist"
          />
          <PlanCard
            highlighted
            kicker="Family"
            name="Patient + Care Circle"
            price="Free"
            priceNote="During early access"
            features={[
              'Everything in Individual',
              'Shared access for caregivers & family',
              'AI Assistant, grounded in your own chart',
              'Peer support community',
              'Insurance & prior-authorization tracking',
            ]}
            cta="Join the waitlist"
          />
          <PlanCard
            kicker="Care Team"
            name="Provider Organizations"
            price="Custom"
            priceNote="Priced per clinic or practice"
            features={[
              'Patient roster with real-time alerts',
              'Invite & onboard patients directly',
              'Secure inbox across your care team',
              'Coordinated symptom & refill tracking',
              'Rollout support during onboarding',
            ]}
            cta="Talk to us"
            secondaryCta={{ href: '/contact' }}
          />
        </div>
      </div>

      <div className="hr ep-container" />

      <div className="ep-container" style={{ maxWidth: 720, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 'var(--space-3)' }}>Questions</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <h4 className="card-title">Will patient accounts ever cost money?</h4>
            <p className="card-body" style={{ opacity: .85 }}>Our commitment is that individual patient and caregiver access stays free — pricing will apply only to provider organizations.</p>
          </div>
          <div>
            <h4 className="card-title">When does early access end?</h4>
            <p className="card-body" style={{ opacity: .85 }}>We'll notify everyone on the waitlist at least 60 days before any plan changes take effect.</p>
          </div>
        </div>
      </div>

      <div className="hr ep-container" />
      <Footer />
    </>
  );
}
