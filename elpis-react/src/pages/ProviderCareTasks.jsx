import { Link } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderCareTasks } from '../hooks/useProviderCareTasks.js';
import './dashboardGlass.css';

const CATEGORY_LABEL = { insurance_help: 'Insurance help', other: 'Other' };

function TaskRow({ task, onUpdateStatus, dim }) {
  return (
    <div className="ep-doc-row" style={dim ? { opacity: 0.55 } : undefined}>
      <div className="ep-avatar">{task.patientName?.split(' ').map((w) => w[0]).join('')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14 }}>
          {dim ? task.patientName : (
            <Link to={`/provider/patients/${task.patient_id}`} style={{ color: 'var(--color-text)' }}>{task.patientName}</Link>
          )}
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{task.note || 'No additional details provided.'}</div>
      </div>
      <span className="tag tag-neutral">{CATEGORY_LABEL[task.category] ?? task.category}</span>
      {!dim && task.status === 'open' && (
        <button className="btn btn-secondary" onClick={() => onUpdateStatus(task.id, 'in_progress')}>Mark in progress</button>
      )}
      {!dim && (
        <button className="btn btn-primary" onClick={() => onUpdateStatus(task.id, 'done')}>Mark done</button>
      )}
    </div>
  );
}

export default function ProviderCareTasks() {
  const { tasks, loading, updateStatus } = useProviderCareTasks();

  const open = tasks.filter((t) => t.status === 'open');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <div className="ep-shell-dash gl-shell">
      <ProviderSidebar active="Care Tasks" />

      <div className="ep-main">
      <div className="gl-dash">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Care Tasks</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>"Need help with this?" requests raised by patients across your roster.</p>
        </div>

        {loading && <p className="text-muted" style={{ fontSize: 13 }}>Loading…</p>}

        {!loading && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Open ({open.length + inProgress.length})</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {open.length === 0 && inProgress.length === 0 && (
                <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>No open tasks — all caught up.</p>
              )}
              {[...open, ...inProgress].map((task) => (
                <TaskRow key={task.id} task={task} onUpdateStatus={updateStatus} />
              ))}
            </div>

            {done.length > 0 && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Done</h2>
                <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                  {done.map((task) => (
                    <TaskRow key={task.id} task={task} dim />
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
