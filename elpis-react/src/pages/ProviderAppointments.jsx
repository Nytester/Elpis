import { Link } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderAppointments } from '../hooks/useProviderAppointments.js';
import './dashboardGlass.css';

const STATUS_TAG = { scheduled: 'tag-accent-2', completed: 'tag-neutral', cancelled: 'tag-outline' };

function formatWhen(iso) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay(d, today)) return `Today, ${time}`;
  if (sameDay(d, tomorrow)) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${time}`;
}

function AppointmentRow({ appt, onUpdateStatus, dim }) {
  return (
    <div className="ep-doc-row" style={dim ? { opacity: 0.55 } : undefined}>
      <div className="ep-avatar">{appt.patientName?.split(' ').map((w) => w[0]).join('')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14 }}>
          {dim ? appt.patientName : (
            <Link to={`/provider/patients/${appt.patient_id}`} style={{ color: 'var(--color-text)' }}>{appt.patientName}</Link>
          )}
          <span className="text-muted" style={{ fontSize: 12 }}> · {appt.type}</span>
        </div>
        <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
          {formatWhen(appt.scheduled_at)}{appt.location ? ` · ${appt.location}` : ''}
        </div>
      </div>
      <span className={`tag ${STATUS_TAG[appt.status]}`}>{appt.status}</span>
      {!dim && (
        <>
          <button className="btn btn-secondary" onClick={() => onUpdateStatus(appt.id, 'completed')}>Mark complete</button>
          <button className="btn btn-secondary" onClick={() => onUpdateStatus(appt.id, 'cancelled')}>Cancel</button>
        </>
      )}
    </div>
  );
}

export default function ProviderAppointments() {
  const { upcoming, past, loading, updateStatus } = useProviderAppointments();

  return (
    <div className="ep-shell-dash gl-shell">
      <ProviderSidebar active="Appointments" />

      <div className="ep-main">
      <div className="gl-dash">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Appointments</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Every scheduled visit across your roster, in one list.</p>
        </div>

        {loading && <p className="text-muted" style={{ fontSize: 13 }}>Loading…</p>}

        {!loading && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Upcoming ({upcoming.length})</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {upcoming.length === 0 && <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>No upcoming appointments scheduled.</p>}
              {upcoming.map((appt) => (
                <AppointmentRow key={appt.id} appt={appt} onUpdateStatus={updateStatus} />
              ))}
            </div>

            {past.length > 0 && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Past</h2>
                <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                  {past.map((appt) => (
                    <AppointmentRow key={appt.id} appt={appt} dim />
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
