import { Link } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderInbox } from '../hooks/useProviderInbox.js';
import './dashboardGlass.css';

export default function ProviderInbox() {
  const { items, loading, markHandled } = useProviderInbox();

  const pending = items.filter((i) => !i.handled);
  const handled = items.filter((i) => i.handled);

  return (
    <div className="ep-shell-dash gl-shell">
      <ProviderSidebar active="Inbox" />

      <div className="ep-main">
      <div className="gl-dash">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Inbox</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Medication refill requests across your roster.</p>
        </div>

        {loading && <p className="text-muted" style={{ fontSize: 13 }}>Loading…</p>}

        {!loading && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Pending ({pending.length})</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {pending.length === 0 && <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>All caught up.</p>}
              {pending.map((item) => (
                <div key={item.id} className="ep-doc-row">
                  <div className="ep-avatar">{item.patientName?.split(' ').map((w) => w[0]).join('')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14 }}>
                      <Link to={`/provider/patients/${item.patientId}`} style={{ color: 'var(--color-text)' }}>{item.patientName}</Link>
                    </div>
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{item.text}</div>
                  </div>
                  <span className="tag tag-neutral">Refill request</span>
                  <button className="btn btn-secondary" onClick={() => markHandled(item.id)}>Mark handled</button>
                </div>
              ))}
            </div>

            {handled.length > 0 && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Handled</h2>
                <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                  {handled.map((item) => (
                    <div key={item.id} className="ep-doc-row" style={{ opacity: 0.55 }}>
                      <div className="ep-avatar">{item.patientName?.split(' ').map((w) => w[0]).join('')}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14 }}>{item.patientName}</div>
                        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{item.text}</div>
                      </div>
                      <span className="tag tag-neutral">Refill request</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
