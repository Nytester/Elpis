import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import { useCareTasks } from '../hooks/useCareTasks.js';
import { findHospitalById, directionsUrl } from '../lib/hospitals.js';
import './dashboardGlass.css';

const STATUS_TAG = {
  scheduled: { label: 'Scheduled', cls: 'gl-tag' },
  completed: { label: 'Completed', cls: 'gl-tag-mild' },
  cancelled: { label: 'Cancelled', cls: 'gl-tag-severe' },
};

function formatWhen(iso) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  };
}

function RescheduleButton({ patientId, appointment }) {
  const { tasks, createTask } = useCareTasks(patientId);
  const [sent, setSent] = useState(false);
  const existing = tasks.find((t) => t.authorization_id === null && t.note?.includes(appointment.id) && t.status !== 'done');

  const handleClick = async () => {
    await createTask({ note: `Requested a different time for "${appointment.type}" (appointment ${appointment.id})` });
    setSent(true);
  };

  if (existing || sent) {
    return <span className="gl-tag gl-tag-mild">Reschedule requested</span>;
  }
  return <button className="gl-pill" onClick={handleClick}>Request a different time</button>;
}

function AppointmentCard({ patientId, appointment }) {
  const { date, time } = formatWhen(appointment.scheduled_at);
  const status = STATUS_TAG[appointment.status] ?? STATUS_TAG.scheduled;
  const linkedHospital = appointment.hospital_id ? findHospitalById(appointment.hospital_id) : null;
  return (
    <div className="gl-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{appointment.type}</div>
          <div style={{ fontSize: 13, color: 'rgba(34,48,43,.6)', marginTop: 2 }}>{date} · {time}</div>
        </div>
        <span className={`gl-tag ${status.cls}`}>{status.label}</span>
      </div>
      {appointment.location && <div style={{ fontSize: 13, color: 'rgba(34,48,43,.6)' }}>{appointment.location}</div>}
      {appointment.provider_note && <p style={{ fontSize: 13, color: 'rgba(34,48,43,.7)', margin: 0 }}>{appointment.provider_note}</p>}
      {linkedHospital && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, background: 'rgba(29,122,95,.08)', borderRadius: 10, padding: '8px 12px' }}>
          <span style={{ flex: 1, color: '#1d7a5f' }}>📍 {linkedHospital.name}</span>
          <a href={directionsUrl(linkedHospital)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: '#1d7a5f', fontWeight: 600 }}>Get directions →</a>
        </div>
      )}
      {appointment.status === 'scheduled' && (
        <div style={{ marginTop: 4 }}>
          <RescheduleButton patientId={patientId} appointment={appointment} />
        </div>
      )}
    </div>
  );
}

export default function Appointments() {
  const { patientId, appointments } = usePatientData();
  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.scheduled_at) >= now && a.status !== 'cancelled');
  const past = appointments.filter((a) => new Date(a.scheduled_at) < now || a.status === 'cancelled').slice().reverse();

  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Appointments" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ marginBottom: 20 }}>
            <h1 className="gl-greeting">Appointments</h1>
            <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginTop: 4 }}>Everything your care team has scheduled for you.</p>
          </div>

          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Upcoming</div>
          {upcoming.length === 0 ? (
            <div className="gl-panel" style={{ padding: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 13.5, color: 'rgba(34,48,43,.6)', margin: 0 }}>
                Nothing scheduled yet. Once your care team schedules an appointment, it'll show up here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {upcoming.map((a) => <AppointmentCard key={a.id} patientId={patientId} appointment={a} />)}
            </div>
          )}

          {past.length > 0 && (
            <>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Past</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {past.map((a) => <AppointmentCard key={a.id} patientId={patientId} appointment={a} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
