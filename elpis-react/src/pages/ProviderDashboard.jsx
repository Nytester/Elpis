import { Link } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderRoster } from '../hooks/useProviderRoster.js';

const PHASE_TAG = { Treatment: 'tag-accent-2', Surveillance: 'tag-neutral', Survivorship: 'tag-outline' };

export default function ProviderDashboard() {
  const { patients, loading } = useProviderRoster();
  const flagged = patients.filter((p) => p.alert);

  return (
    <div className="ep-shell-dash">
      <ProviderSidebar active="Patient Roster" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Patient Roster</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Oncology care team · {patients.length} active patients</p>
        </div>

        {loading && <p className="text-muted" style={{ fontSize: 13 }}>Loading roster…</p>}

        {flagged.length > 0 && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Needs attention</h2>
            <div className="ep-resource-grid">
              {flagged.map((p) => (
                <div key={p.id} className="card elev-sm" style={{ borderColor: 'var(--color-accent)' }}>
                  <span className="tag tag-accent" style={{ alignSelf: 'flex-start' }}>Alert</span>
                  <h3 className="card-title" style={{ fontSize: 15, marginTop: 4 }}>{p.full_name}</h3>
                  <p className="card-body" style={{ fontSize: 12 }}>{p.alert}</p>
                  <Link className="btn btn-secondary btn-block" to={`/provider/patients/${p.id}`}>View patient</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>All patients</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
              {patients.map((p) => (
                <div key={p.id} className="ep-doc-row">
                  <div className="ep-avatar">{p.full_name?.split(' ').map((w) => w[0]).join('')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14 }}>{p.full_name} <span className="text-muted" style={{ fontSize: 12 }}>· {p.age}</span></div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{p.diagnosis} · Last check-in: {p.last_check_in_note}</div>
                  </div>
                  <span className={`tag ${PHASE_TAG[p.phase]}`}>{p.phase}</span>
                  {p.pendingRefills > 0 && <span className="tag tag-neutral">{p.pendingRefills} refill{p.pendingRefills > 1 ? 's' : ''}</span>}
                  {p.alert && <span className="tag tag-accent">Alert</span>}
                  <Link className="btn btn-secondary" to={`/provider/patients/${p.id}`}>View</Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
