import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderPatient } from '../hooks/useProviderPatient.js';
import { getSteps } from '../lib/authorizationSteps.js';

const SEVERITY_TAG = { Mild: 'tag-neutral', Moderate: 'tag-accent-2', Severe: 'tag-accent' };

export default function ProviderPatientDetail() {
  const { id } = useParams();
  const {
    patient, symptoms, refillRequests, messages, sendMessage, alert, loading, markRefillHandled,
    authorizations, addAuthorization, updateAuthorizationStatus, setRiskNote,
  } = useProviderPatient(id);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const [newProcedure, setNewProcedure] = useState('');
  const [riskDraftId, setRiskDraftId] = useState(null);
  const [riskDraftText, setRiskDraftText] = useState('');

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
              <span className="card-kicker">Next appointment</span>
              <h4 className="card-title">{patient.next_appointment_note}</h4>
            </div>

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
