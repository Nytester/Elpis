import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderPatient } from '../hooks/useProviderPatient.js';
import { getSteps } from '../lib/authorizationSteps.js';

const SEVERITY_TAG = { Mild: 'tag-neutral', Moderate: 'tag-accent-2', Severe: 'tag-accent' };
const APPT_STATUS_TAG = { scheduled: 'tag-accent', completed: 'tag-neutral', cancelled: 'tag-accent-2' };

function toLocalInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ProviderPatientDetail() {
  const { id } = useParams();
  const {
    patient, symptoms, refillRequests, messages, sendMessage, alert, loading, markRefillHandled,
    authorizations, addAuthorization, updateAuthorizationStatus, setRiskNote,
    appointments, addAppointment, updateAppointmentStatus, rescheduleAppointment,
  } = useProviderPatient(id);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const [newProcedure, setNewProcedure] = useState('');
  const [riskDraftId, setRiskDraftId] = useState(null);
  const [riskDraftText, setRiskDraftText] = useState('');

  const [showApptForm, setShowApptForm] = useState(false);
  const [apptType, setApptType] = useState('');
  const [apptWhen, setApptWhen] = useState('');
  const [apptLocation, setApptLocation] = useState('');
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleWhen, setRescheduleWhen] = useState('');
  const [rescheduleLocation, setRescheduleLocation] = useState('');

  const handleAddAppointment = (e) => {
    e.preventDefault();
    const type = apptType.trim();
    if (!type || !apptWhen) return;
    addAppointment({ type, scheduledAt: new Date(apptWhen).toISOString(), location: apptLocation.trim() });
    setApptType('');
    setApptWhen('');
    setApptLocation('');
    setShowApptForm(false);
  };

  const openReschedule = (a) => {
    setRescheduleId(a.id);
    setRescheduleWhen(toLocalInputValue(a.scheduled_at));
    setRescheduleLocation(a.location ?? '');
  };

  const saveReschedule = () => {
    if (!rescheduleWhen) return;
    rescheduleAppointment(rescheduleId, new Date(rescheduleWhen).toISOString(), rescheduleLocation.trim());
    setRescheduleId(null);
  };

  const handleAddAuthorization = (e) => {
    e.preventDefault();
    const procedure = newProcedure.trim();
    if (!procedure) return;
    addAuthorization(procedure);
    setNewProcedure('');
  };

  const openRiskEditor = (a) => {
    setRiskDraftId(a.id);
    setRiskDraftText(a.at_risk_note ?? '');
  };

  const saveRiskNote = () => {
    setRiskNote(riskDraftId, riskDraftText.trim());
    setRiskDraftId(null);
    setRiskDraftText('');
  };

  const clearRiskNote = (authorizationId) => {
    setRiskNote(authorizationId, null);
    if (riskDraftId === authorizationId) setRiskDraftId(null);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(text);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="ep-shell-dash">
        <ProviderSidebar active="Patient Roster" />
        <div className="ep-main"><p className="text-muted">Loading…</p></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="ep-shell-dash">
        <ProviderSidebar active="Patient Roster" />
        <div className="ep-main">
          <p>Patient not found.</p>
          <Link className="btn btn-secondary" to="/provider">Back to roster</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-shell-dash">
      <ProviderSidebar active="Patient Roster" />

      <div className="ep-main">
        <Link to="/provider" style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>← Back to roster</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <div className="ep-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{patient.full_name?.split(' ').map((w) => w[0]).join('')}</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 400 }}>{patient.full_name}</h1>
            <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>{patient.age} years old · {patient.diagnosis} · {patient.phase}</p>
          </div>
        </div>

        {alert && (
          <div className="card elev-sm" style={{ borderColor: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
            <span className="tag tag-accent" style={{ alignSelf: 'flex-start' }}>Alert</span>
            <p className="card-body">{alert}</p>
          </div>
        )}

        <div className="ep-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card elev-sm">
              <span className="card-kicker">Recent symptoms</span>
              <h4 className="card-title">Symptom log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
                {symptoms.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No symptoms logged yet.</p>}
                {symptoms.map((s, i) => (
                  <div key={i} className="ep-medrow">
                    <span style={{ flex: 1, fontSize: 14 }}>{s.name}</span>
                    <span className={`tag ${SEVERITY_TAG[s.severity]}`}>{s.severity}</span>
                    <span className="text-muted" style={{ fontSize: 12 }}>{s.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card elev-sm">
              <span className="card-kicker">Refill requests</span>
              <h4 className="card-title">{refillRequests.filter((r) => r.status === 'pending').length} pending</h4>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
                {refillRequests.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No refill requests yet.</p>}
                {refillRequests.map((r) => (
                  <div key={r.id} className="ep-medrow">
                    <span style={{ flex: 1, fontSize: 14 }}>{r.medication_name}</span>
                    {r.status === 'pending' ? (
                      <button className="btn btn-secondary" onClick={() => markRefillHandled(r.id)}>Mark handled</button>
                    ) : (
                      <span className="tag tag-neutral">Handled</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card elev-sm">
              <span className="card-kicker">Care team</span>
              <h4 className="card-title">Assigned provider</h4>
              <Link className="btn btn-primary btn-block" to="/provider/inbox">Go to Inbox</Link>
            </div>
          </div>
        </div>

        <div className="card elev-sm" style={{ marginTop: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="card-kicker">Appointments</span>
            <button className="btn btn-secondary" type="button" onClick={() => setShowApptForm((s) => !s)}>+ Schedule appointment</button>
          </div>
          <h4 className="card-title">Upcoming &amp; past visits</h4>

          {showApptForm && (
            <form onSubmit={handleAddAppointment} style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              <input
                className="input"
                placeholder="Type, e.g. Chemotherapy Infusion — Cycle 5"
                value={apptType}
                onChange={(e) => setApptType(e.target.value)}
                style={{ flex: 2, minWidth: 220 }}
                autoFocus
              />
              <input
                className="input"
                type="datetime-local"
                value={apptWhen}
                onChange={(e) => setApptWhen(e.target.value)}
                style={{ flex: 1, minWidth: 180 }}
              />
              <input
                className="input"
                placeholder="Location (optional)"
                value={apptLocation}
                onChange={(e) => setApptLocation(e.target.value)}
                style={{ flex: 1, minWidth: 160 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!apptType.trim() || !apptWhen}>Schedule</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            {appointments.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No appointments scheduled yet.</p>}
            {appointments.map((a) => (
              <div key={a.id} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{a.type}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>
                      {new Date(a.scheduled_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {a.location ? ` · ${a.location}` : ''}
                    </div>
                  </div>
                  <span className={`tag ${APPT_STATUS_TAG[a.status]}`}>{a.status}</span>
                </div>

                {rescheduleId === a.id ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
                    <input className="input" type="datetime-local" value={rescheduleWhen} onChange={(e) => setRescheduleWhen(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
                    <input className="input" placeholder="Location" value={rescheduleLocation} onChange={(e) => setRescheduleLocation(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
                    <button className="btn btn-primary" onClick={saveReschedule} disabled={!rescheduleWhen}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setRescheduleId(null)}>Cancel</button>
                  </div>
                ) : a.status === 'scheduled' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
                    <button className="btn btn-secondary" onClick={() => openReschedule(a)}>Reschedule</button>
                    <button className="btn btn-secondary" onClick={() => updateAppointmentStatus(a.id, 'completed')}>Mark completed</button>
                    <button className="btn btn-ghost" onClick={() => updateAppointmentStatus(a.id, 'cancelled')}>Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card elev-sm" style={{ marginTop: 'var(--space-4)' }}>
          <span className="card-kicker">Insurance</span>
          <h4 className="card-title">Authorization requests</h4>

          <form onSubmit={handleAddAuthorization} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <input
              className="input"
              placeholder="Procedure, e.g. Cervical spine MRI"
              value={newProcedure}
              onChange={(e) => setNewProcedure(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary" disabled={!newProcedure.trim()}>Log authorization</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            {authorizations.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No authorization requests yet.</p>}
            {authorizations.map((a) => (
              <div key={a.id} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{a.procedure}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>Submitted {a.submitted_date}{a.decision_date ? ` · Decided ${a.decision_date}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {a.status === 'submitted' && (
                      <button className="btn btn-secondary" onClick={() => updateAuthorizationStatus(a.id, 'under_review')}>Mark under review</button>
                    )}
                    {a.status === 'under_review' && (
                      <>
                        <button className="btn btn-secondary" onClick={() => updateAuthorizationStatus(a.id, 'approved', new Date().toISOString().slice(0, 10))}>Approve</button>
                        <button className="btn btn-secondary" onClick={() => updateAuthorizationStatus(a.id, 'denied', new Date().toISOString().slice(0, 10))}>Deny</button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 'var(--space-3)', position: 'relative', padding: '0 var(--space-2)', maxWidth: 320 }}>
                  <div style={{ position: 'absolute', left: '10%', right: '10%', top: 6, height: 1, background: 'var(--color-divider)' }} />
                  {getSteps(a.status).map((s) => (
                    <div key={s.label} className="ep-step">
                      <div className={`ep-dot${s.state ? ' ' + s.state : ''}`} />
                      <span style={{ fontSize: 11, fontWeight: s.state === 'current' ? 600 : 400, color: s.state === 'current' ? 'var(--color-accent-700)' : 'var(--color-neutral-600)' }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
                  {riskDraftId === a.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="input"
                        placeholder="e.g. May delay Aug 5 rehab admission"
                        value={riskDraftText}
                        onChange={(e) => setRiskDraftText(e.target.value)}
                        style={{ flex: 1 }}
                        autoFocus
                      />
                      <button className="btn btn-primary" onClick={saveRiskNote}>Save</button>
                      <button className="btn btn-secondary" onClick={() => setRiskDraftId(null)}>Cancel</button>
                    </div>
                  ) : a.at_risk_note ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="tag tag-accent">May affect care</span>
                      <span style={{ fontSize: 13, flex: 1 }}>{a.at_risk_note}</span>
                      <button className="btn btn-secondary" onClick={() => clearRiskNote(a.id)}>Clear flag</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost" onClick={() => openRiskEditor(a)}>+ Flag delay risk to care team</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card elev-sm" style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
          <span className="card-kicker">Messages</span>
          <h4 className="card-title">Conversation with {patient.full_name}</h4>

          <div ref={scrollRef} className="ep-msg-thread" style={{ maxHeight: 320 }}>
            {messages.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No messages yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`ep-msg ${m.from === 'me' ? 'ep-msg-out' : 'ep-msg-in'}`}>
                <div>{m.text}</div>
                <div className="ep-msg-time">{m.time}</div>
              </div>
            ))}
          </div>

          {patient.profile_id ? (
            <div className="ep-msg-input-row">
              <textarea
                className="input"
                rows={1}
                placeholder={`Message ${patient.full_name}...`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ resize: 'none', flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleSend} disabled={!draft.trim()}>Send</button>
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: 12, paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
              This patient hasn't created an account yet — messaging isn't available until they sign up.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
