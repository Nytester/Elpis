import Sidebar from '../components/Sidebar.jsx';
import HospitalFinderPanel from '../components/HospitalFinderPanel.jsx';

export default function Transportation() {
  return (
    <div className="ep-shell-dash">
      <Sidebar active="Transportation" />
      <div className="ep-main">
        <HospitalFinderPanel title="Transportation" />
      </div>
    </div>
  );
}
