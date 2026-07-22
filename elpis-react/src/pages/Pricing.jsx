import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function Pricing() {
  return (
    <>
      <Navbar />

      <div className="ep-container" style={{ maxWidth: 720, textAlign: 'center', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-6)' }}>
        <span className="tag tag-outline">Coming soon</span>
        <h1 style={{ fontSize: 44, fontWeight: 400, marginTop: 'var(--space-3)' }}>Pricing is still taking shape.</h1>
        <p style={{ fontSize: 16, opacity: .85, marginTop: 'var(--space-3)' }}>We're finalizing plans alongside the clinics piloting Elpis. Every patient account is free during early access — join the list below and we'll let you know before anything changes.</p>
      </div>

      <div className="ep-container" style={{ paddingBottom: 'var(--space-8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
          <div className="card elev-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <span className="card-kicker">Individual</span>
            <h3 className="card-title" style={{ fontSize: 22 }}>Patient &amp; Caregiver</h3>
            <p className="card-body">Dashboard, timeline, appointments, medications, symptoms and one care team thread.</p>
            <div style={{ marginTop: 'auto' }}>
              <span className="tag tag-accent">Free in early access</span>
              <div className="btn btn-secondary btn-block" style={{ marginTop: 'var(--space-3)' }}>Join the waitlist</div>
            </div>
          </div>
          <div className="card elev-md" style={{ borderColor: 'var(--color-accent)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <span className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Family</span>
            <h3 className="card-title" style={{ fontSize: 22 }}>Patient + Care Circle</h3>
            <p className="card-body">Everything in Individual, plus shared access for caregivers and family members.</p>
            <div style={{ marginTop: 'auto' }}>
              <span className="tag tag-accent">Free in early access</span>
              <div className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-3)' }}>Join the waitlist</div>
            </div>
          </div>
          <div className="card elev-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <span className="card-kicker">Care Team</span>
            <h3 className="card-title" style={{ fontSize: 22 }}>Provider Organizations</h3>
            <p className="card-body">Provider &amp; admin portals, patient rosters and coordination across a clinic or practice.</p>
            <div style={{ marginTop: 'auto' }}>
              <span className="tag tag-neutral">Custom, by request</span>
              <div className="btn btn-secondary btn-block" style={{ marginTop: 'var(--space-3)' }}>Talk to us</div>
            </div>
          </div>
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
