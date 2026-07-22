import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SEVERITY_TAG = { Mild: 'tag-neutral', Moderate: 'tag-accent-2', Severe: 'tag-accent' };

const INITIAL_MEDS = [
  { id: 1, name: 'Ondansetron 8mg', time: '8:00 AM', done: true },
  { id: 2, name: 'Dexamethasone 4mg', time: '8:00 AM', done: true },
  { id: 3, name: 'Lorazepam 0.5mg', time: '12:00 PM', done: true },
  { id: 4, name: 'Prochlorperazine 10mg', time: '6:00 PM', done: false },
];

export default function Dashboard() {
  const [meds, setMeds] = useState(INITIAL_MEDS);
  const { symptoms, authorizations } = usePatientData();
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] ?? '';

  const toggleMed = (id) => setMeds((ms) => ms.map((m) => m.id === id ? { ...m, done: !m.done } : m));

  const atRiskAuth = authorizations.find((a) => a.at_risk_note && !['approved', 'denied'].includes(a.status));

  return (
    <div className="ep-shell-dash">
      <Sidebar active="Dashboard" />

      {/* Main */}
      <div className="ep-main">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 400 }}>Good afternoon{firstName ? `, ${firstName}` : ''}.</h1>
            <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Day 62 of treatment</p>
          </div>
          <a className="btn btn-secondary" href="#">Log a symptom</a>
        </div>

        {atRiskAuth && (
          <div className="card elev-sm" style={{ borderColor: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
            <span className="tag tag-accent" style={{ alignSelf: 'flex-start' }}>May affect your care</span>
            <h4 className="card-title" style={{ marginTop: 4 }}>{atRiskAuth.procedure} authorization: {atRiskAuth.at_risk_note}</h4>
            <Link className="btn btn-secondary" to="/dashboard/insurance">View insurance status</Link>
          </div>
        )}

        <div className="ep-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card elev-sm" style={{ borderColor: 'var(--color-accent)' }}>
              <span className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Next appointment</span>
              <h3 className="card-title" style={{ fontSize: 20, marginTop: 4 }}>Chemotherapy infusion — Cycle 4</h3>
              <p className="card-body">Tomorrow, Friday July 17 · 9:30 AM · Dana‑Farber Infusion Suite, Room 12</p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <a className="btn btn-primary" href="#">View details</a>
                <a className="btn btn-secondary" href="#">Add to calendar</a>
              </div>
            </div>

            <div className="card elev-sm">
              <span className="card-kicker">Journey</span>
              <h4 className="card-title">Your treatment path</h4>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--space-3)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '6%', right: '6%', top: 6, height: 1, background: 'var(--color-divider)' }} />
                {[
                  { label: 'Diagnosis', state: 'past' },
                  { label: 'Staging', state: 'past' },
                  { label: 'Treatment', state: 'current' },
                  { label: 'Surveillance', state: '' },
                  { label: 'Survivorship', state: '' },
                ].map(({ label, state }) => (
                  <div key={label} className="ep-step">
                    <div className={`ep-dot${state ? ' ' + state : ''}`} />
                    <span style={{ fontSize: 11, fontWeight: state === 'current' ? 600 : 400, color: state === 'current' ? 'var(--color-accent-700)' : 'var(--color-neutral-600)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card elev-sm">
              <span className="card-kicker">Recent symptoms</span>
              <h4 className="card-title">Symptom log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
                {symptoms.slice(0, 3).map((s) => (
                  <div key={s.id} className="ep-medrow">
                    <span style={{ flex: 1, fontSize: 14 }}>{s.symptom}</span>
                    <span className={`tag ${SEVERITY_TAG[s.severity]}`}>{s.severity}</span>
                    <span className="text-muted" style={{ fontSize: 12 }}>{s.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card elev-sm">
              <span className="card-kicker">Today's medications</span>
              <h4 className="card-title">{meds.filter((m) => m.done).length} of {meds.length} taken</h4>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
                {meds.map((med) => (
                  <div key={med.id} className="ep-medrow">
                    <span className={`ep-check${med.done ? ' done' : ''}`} onClick={() => toggleMed(med.id)}>
                      {med.done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14 }}>{med.name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{med.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card elev-sm">
              <span className="card-kicker">Care team</span>
              <h4 className="card-title">Reach your team</h4>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
                {[
                  { id: 'osei', initials: 'DR', name: 'Dr. Rina Osei', role: 'Oncologist' },
                  { id: 'tran', initials: 'JT', name: 'Jordan Tran, RN', role: 'Nurse Navigator' },
                  { id: 'chen', initials: 'SC', name: 'Sam Chen', role: 'Caregiver' },
                ].map(({ id, initials, name, role }) => (
                  <div key={id} className="ep-contact">
                    <div className="ep-avatar">{initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>{name}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{role}</div>
                    </div>
                    <Link className="btn btn-icon btn-ghost" to={`/dashboard/care-team?contact=${id}`} aria-label={`Message ${name}`}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 1 1-4-7.2" /><path d="M21 4v6h-6" /></svg>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="card elev-sm" style={{ background: 'var(--color-surface)' }}>
              <span className="card-kicker" style={{ color: 'var(--color-accent-700)' }}>Ask Elpis</span>
              <h4 className="card-title">Your AI assistant</h4>
              <p className="card-body">Ask about symptoms, meds, or what's next — grounded in your own chart.</p>
              <Link className="btn btn-primary btn-block" to="/dashboard/assistant">Open assistant</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
