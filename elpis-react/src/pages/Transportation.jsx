import Sidebar from '../components/Sidebar.jsx';
import HospitalFinderPanel from '../components/HospitalFinderPanel.jsx';
import './dashboardGlass.css';

// HospitalFinderPanel is shared with the public, no-login /hospital-finder
// page (pages/HospitalFinder.jsx), which stays in the classic theme — so it
// isn't rewritten with gl- classNames like the other dashboard pages.
// Wrapping it in .gl-dash here reskins it automatically via the custom-
// property overrides in dashboardGlass.css, without touching the shared
// component or affecting the public page (which never gets that wrapper).
export default function Transportation() {
  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Transportation" />
      <div className="ep-main">
        <div className="gl-dash">
          <HospitalFinderPanel title="Transportation" />
        </div>
      </div>
    </div>
  );
}
