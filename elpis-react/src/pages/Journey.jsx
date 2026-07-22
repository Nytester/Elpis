import Sidebar from '../components/Sidebar.jsx';

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

const STATUS_TAG = { current: { label: 'Current', cls: 'tag-accent' }, upcoming: { label: 'Upcoming', cls: 'tag-neutral' } };

export default function Journey() {
  return (
    <div className="ep-shell-dash">
      <Sidebar active="Journey Timeline" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Journey Timeline</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Your care path from diagnosis through survivorship.</p>
        </div>

        <div className="card elev-sm" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="card-kicker">Overview</span>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 'var(--space-4)', position: 'relative', padding: '0 var(--space-2)' }}>
            <div style={{ position: 'absolute', left: '6%', right: '6%', top: 6, height: 1, background: 'var(--color-divider)' }} />
            {PHASES.map(({ label, state, range }) => (
              <div key={label} className="ep-step">
                <div className={`ep-dot${state ? ' ' + state : ''}`} />
                <span style={{ fontSize: 12, fontWeight: state === 'current' ? 600 : 400, color: state === 'current' ? 'var(--color-accent-700)' : 'var(--color-neutral-600)' }}>{label}</span>
                <span className="text-muted" style={{ fontSize: 10 }}>{range}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Milestones</h2>
        <div className="card elev-sm">
          <div className="ep-vtimeline">
            {MILESTONES.map((m) => (
              <div key={m.title} className="ep-vitem">
                <span className={`ep-vdot ${m.status}`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: m.status === 'current' ? 600 : 400 }}>{m.title}</div>
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{m.desc}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flex: 'none' }}>
                    <span className="text-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{m.date}</span>
                    {STATUS_TAG[m.status] && <span className={`tag ${STATUS_TAG[m.status].cls}`}>{STATUS_TAG[m.status].label}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
