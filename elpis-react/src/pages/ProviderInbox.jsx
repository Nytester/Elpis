import { Link } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderInbox } from '../hooks/useProviderInbox.js';
import { formatRelativeDate } from '../lib/formatDate.js';
import './dashboardGlass.css';

function InboxRow({ avatarName, primary, secondary, tag, tagCls = 'tag-neutral', action, dim }) {
  return (
    <div className="ep-doc-row" style={dim ? { opacity: 0.55 } : undefined}>
      <div className="ep-avatar">{avatarName?.split(' ').map((w) => w[0]).join('')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14 }}>{primary}</div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{secondary}</div>
      </div>
      {tag && <span className={`tag ${tagCls}`}>{tag}</span>}
      {action}
    </div>
  );
}

export default function ProviderInbox() {
  const { pendingRefills, handledRefills, needsReply, severeSymptoms, totalNeedsAttention, loading, markHandled } = useProviderInbox();

  return (
    <div className="ep-shell-dash gl-shell">
      <ProviderSidebar active="Inbox" />

      <div className="ep-main">
      <div className="gl-dash">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Inbox</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
            {loading ? 'Loading…' : totalNeedsAttention > 0
              ? `${totalNeedsAttention} item${totalNeedsAttention === 1 ? '' : 's'} across your roster need attention.`
              : 'Everything across your roster is caught up.'}
          </p>
        </div>

        {!loading && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Needs your reply ({needsReply.length})</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {needsReply.length === 0 && <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>No open threads — every patient's last message has been answered.</p>}
              {needsReply.map((m) => (
                <InboxRow
                  key={m.id}
                  avatarName={m.patientName}
                  primary={<Link to={`/provider/patients/${m.patientId}`} style={{ color: 'var(--color-text)' }}>{m.patientName}</Link>}
                  secondary={m.text}
                  tag={formatRelativeDate(m.time)}
                  action={<Link className="btn btn-secondary" to={`/provider/patients/${m.patientId}`}>Reply</Link>}
                />
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Recent severe symptoms ({severeSymptoms.length})</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {severeSymptoms.length === 0 && <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>No severe symptoms logged in the last 7 days.</p>}
              {severeSymptoms.map((s) => (
                <InboxRow
                  key={s.id}
                  avatarName={s.patientName}
                  primary={<Link to={`/provider/patients/${s.patientId}`} style={{ color: 'var(--color-text)' }}>{s.patientName}</Link>}
                  secondary={s.text}
                  tag={formatRelativeDate(s.time)}
                  tagCls="tag-accent"
                  action={<Link className="btn btn-secondary" to={`/provider/patients/${s.patientId}`}>View patient</Link>}
                />
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Refill requests ({pendingRefills.length} pending)</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: handledRefills.length > 0 ? 'var(--space-6)' : 0 }}>
              {pendingRefills.length === 0 && <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>All caught up.</p>}
              {pendingRefills.map((item) => (
                <InboxRow
                  key={item.id}
                  avatarName={item.patientName}
                  primary={<Link to={`/provider/patients/${item.patientId}`} style={{ color: 'var(--color-text)' }}>{item.patientName}</Link>}
                  secondary={item.text}
                  tag="Refill request"
                  action={<button className="btn btn-secondary" onClick={() => markHandled(item.id)}>Mark handled</button>}
                />
              ))}
            </div>

            {handledRefills.length > 0 && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Handled</h2>
                <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                  {handledRefills.map((item) => (
                    <InboxRow key={item.id} avatarName={item.patientName} primary={item.patientName} secondary={item.text} tag="Refill request" dim />
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
