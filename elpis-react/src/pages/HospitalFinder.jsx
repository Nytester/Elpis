import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import HospitalFinderPanel from '../components/HospitalFinderPanel.jsx';

export default function HospitalFinder() {
  return (
    <>
      <Navbar />
      <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
        <HospitalFinderPanel title="Hospital Finder" />
      </div>
      <div className="hr ep-container" />
      <Footer />
    </>
  );
}
