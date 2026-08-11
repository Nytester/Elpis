import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import HospitalFinderPanel from '../components/HospitalFinderPanel.jsx';
import './dashboardGlass.css';

export default function HospitalFinder() {
  return (
    <div className="gl-public">
      <div className="gl-hero-scene" style={{ '--gl-hero-img': "url('/hospital-hero.jpg')", '--gl-hero-pos': 'center 55%' }}>
        <Navbar />
        <div className="ep-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)', maxWidth: 680 }}>
          <div className="gl-hero-scrim" aria-hidden="true" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="gl-hero-eyebrow">No account needed</span>
            <h1 className="gl-hero-title" style={{ fontSize: 48 }}>Find care,<br /><em>close to home.</em></h1>
            <p className="gl-hero-sub" style={{ margin: 'var(--space-4) auto 0' }}>
              Search any zip code for nearby hospitals and cancer treatment centers, sorted by distance — free to use, no sign-in required.
            </p>
          </div>
        </div>
      </div>

      <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        <HospitalFinderPanel title="Hospital Finder" />
      </div>
      <Footer />
    </div>
  );
}
