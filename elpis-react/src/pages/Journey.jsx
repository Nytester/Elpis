import Sidebar from '../components/Sidebar.jsx';
import './dashboardGlass.css';

const PHASES = [
  { label: 'Diagnosis', state: 'past', range: 'May 2026' },
  { label: 'Staging', state: 'past', range: 'May 2026' },
  { label: 'Treatment', state: 'current', range: 'May – Aug 2026' },
  { label: 'Surveillance', state: '', range: 'Starts Sep 2026' },
  { label: 'Survivorship', state: '', range: 'TBD' },
];

const MILESTONES = [
  { date: 'May 2, 2026', title: 'Diagnosis confirmed', desc: 'Pathology report confirmed Stage IIB diagnosis following biopsy.', status: 'done' },
  { date: 'May 10, 2026', title: 'Staging complete', desc: 'CT scan and bloodwork completed to determine treatment plan.', status: 'done' },
  { date: 'May 20, 2026', title: 'Treatment plan finalized', desc: 'Dr. Osei outlined a 4-cycle chemotherapy plan with Jordan Tran as nurse navigator.', status: 'done' },
  { date: 'May 22, 2026', title: 'Cycle 1 — Chemotherapy infusion', desc: 'First infusion completed at Dana-Farber Infusion Suite.', status: 'done' },
  { date: 'Jun 7, 2026', title: 'Cycle 2 — Chemotherapy infusion', desc: 'Mild nausea managed with an adjusted anti-emetic schedule.', status: 'done' },
  { date: 'Jun 28, 2026', title: 'Cycle 3 — Chemotherapy infusion', desc: 'Bloodwork stable; treatment continued on schedule.', status: 'done' },
  { date: 'Jul 17, 2026', title: 'Cycle 4 — Chemotherapy infusion', desc: 'Final scheduled infusion of this treatment block, at Dana-Farber Infusion Suite, Room 12.', status: 'current' },
  { date: 'Aug 2026', title: 'Post-treatment scan', desc: 'Imaging to assess treatment response before moving to surveillance.', status: 'upcoming' },
  { date: 'Sep 2026', title: 'Surveillance begins', desc: 'Quarterly check-ins and scans to monitor recovery.', status: 'upcoming' },
];

const STATUS_TAG = { current: { label: 'Current', bg: 'rgba(29,122,95,.14)', color: '#1d7a5f' }, upcoming: { label: 'Upcoming', bg: 'rgba(34,48,43,.08)', color: 'rgba(34,48,43,.6)' } };

export default function Journey() {
  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Journey Timeline" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ marginBottom: 20 }}>
            <h1 className="gl-greeting">Journey Timeline</h1>
            <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginTop: 4 }}>Your care path from diagnosis through survivorship.</p>
          </div>

          <div className="gl-panel" style={{ padding: 20, marginBottom: 20 }}>
            <span className="gl-kicker">Overview</span>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 16, position: 'relative', padding: '0 8px' }}>
              <div style={{ position: 'absolute', left: '6%', right: '6%', top: 6, height: 1, background: 'rgba(34,48,43,.12)' }} />
              {PHASES.map(({ label, state, range }) => (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                  <div style={{
                    width: state === 'current' ? 13 : 11, height: state === 'current' ? 13 : 11, borderRadius: '50%',
                    background: state === 'current' ? '#1d7a5f' : state === 'past' ? 'rgba(29,122,95,.45)' : '#fff',
                    border: state ? 'none' : '2px solid rgba(34,48,43,.2)',
                    boxShadow: state === 'current' ? '0 0 0 3px rgba(29,122,95,.2)' : 'none',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: state === 'current' ? 600 : 400, color: state === 'current' ? '#1d7a5f' : 'rgba(34,48,43,.6)' }}>{label}</span>
                  <span style={{ fontSize: 10, color: 'rgba(34,48,43,.45)' }}>{range}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Milestones</div>
          <div className="gl-panel" style={{ padding: 20 }}>
            <div className="gl-vtimeline">
              {MILESTONES.map((m) => (
                <div key={m.title} className="gl-vitem">
                  <span className={`gl-vdot ${m.status}`} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: m.status === 'current' ? 600 : 400 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(34,48,43,.55)', marginTop: 2 }}>{m.desc}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flex: 'none' }}>
                      <span style={{ fontSize: 12, color: 'rgba(34,48,43,.55)', whiteSpace: 'nowrap' }}>{m.date}</span>
                      {STATUS_TAG[m.status] && (
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: STATUS_TAG[m.status].bg, color: STATUS_TAG[m.status].color }}>{STATUS_TAG[m.status].label}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
