import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './dashboardGlass.css';

const SEVERITY_TAG = { Mild: 'gl-tag', Moderate: 'gl-tag-accent', Severe: 'gl-tag-accent' };

const INITIAL_MEDS = [
  { id: 1, name: 'Ondansetron 8mg', time: '8:00 AM', done: true },
  { id: 2, name: 'Dexamethasone 4mg', time: '8:00 AM', done: true },
  { id: 3, name: 'Lorazepam 0.5mg', time: '12:00 PM', done: true },
  { id: 4, name: 'Prochlorperazine 10mg', time: '6:00 PM', done: false },
];

const VISIT_COLORS = ['#1d7a5f', '#7a4fb8', '#b5732a'];

function formatVisitDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  if (sameDay(d, tomorrow)) return `Tomorrow, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const JOURNEY_PHASES = [
  { label: 'Diagnosis', state: 'past' },
  { label: 'Staging', state: 'past' },
  { label: 'Treatment', state: 'current' },
  { label: 'Surveillance', state: '' },
  { label: 'Survivorship', state: '' },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function monthGrid(date) {
  const year = date.getFullYear(), month = date.getMonth(), today = date.getDate();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const days = [];
  for (let i = first - 1; i >= 0; i--) days.push({ n: prevMonthDays - i, cls: 'dim' });
  for (let d = 1; d <= daysInMonth; d++) days.push({ n: d, cls: d === today ? 'today' : '' });
  let next = 1;
  while (days.length % 7 !== 0) days.push({ n: next++, cls: 'dim' });
  return days;
}

export default function Dashboard() {
  const [meds, setMeds] = useState(INITIAL_MEDS);
  const { symptoms, authorizations, appointments } = usePatientData();
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] ?? '';
  const now = useClock();

  const toggleMed = (id) => setMeds((ms) => ms.map((m) => m.id === id ? { ...m, done: !m.done } : m));
  const atRiskAuth = authorizations.find((a) => a.at_risk_note && !['approved', 'denied'].includes(a.status));
  const upcomingAppointments = appointments.filter((a) => new Date(a.scheduled_at) >= now && a.status !== 'cancelled');
  const nextAppointment = upcomingAppointments[0];
  const days = monthGrid(now);
  const monthLabel = now.toLocaleDateString([], { month: 'short', year: 'numeric' });
  const timeLabel = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Dashboard" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
            <h1 className="gl-greeting" style={{ flex: 1 }}>Good afternoon{firstName ? `, ${firstName}` : ''}.</h1>
            <Link className="gl-pill" to="/dashboard/symptoms">Log a symptom</Link>
            <div className="gl-avatar gl-avatar-lg" style={{ background: '#1d7a5f' }}>
              {firstName ? firstName[0].toUpperCase() : 'Y'}
            </div>
          </div>

          {atRiskAuth && (
            <div className="gl-panel" style={{ padding: 16, marginBottom: 18, borderColor: '#b5732a' }}>
              <span className="gl-tag gl-tag-accent" style={{ marginBottom: 6 }}>May affect your care</span>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{atRiskAuth.procedure} authorization: {atRiskAuth.at_risk_note}</div>
              <Link className="gl-pill" style={{ marginTop: 10, display: 'inline-flex' }} to="/dashboard/insurance">View insurance status</Link>
            </div>
          )}

          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            {/* Hero column */}
            <div style={{ flex: '1.15 1 0%', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span className="gl-kicker">Overview</span>
                <span className="gl-sample-tag">Vitals shown are sample data — no device connected</span>
              </div>
              <div className="gl-hero-art">
                <img src="/heart-hero.jpg" alt="" aria-hidden="true" />
                <div className="gl-chip" style={{ left: 14, top: 14 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1d7a5f' }} />
                  Heart rate
                  <div className="gl-ring" style={{ width: 30, height: 30 }}>
                    <svg viewBox="0 0 30 30" width="30" height="30">
                      <circle cx="15" cy="15" r="12" fill="none" stroke="rgba(34,48,43,.15)" strokeWidth="3" />
                      <circle cx="15" cy="15" r="12" fill="none" stroke="#1d7a5f" strokeWidth="3" strokeLinecap="round" strokeDasharray="57 75" transform="rotate(-90 15 15)" />
                    </svg>
                    <div className="gl-ring-label" style={{ fontSize: 9 }}>76%</div>
                  </div>
                </div>
                <div className="gl-chip" style={{ left: 14, bottom: 14, flexDirection: 'column', alignItems: 'flex-start', gap: 4, borderRadius: 14, padding: '10px 14px' }}>
                  <span style={{ fontSize: 10, color: 'rgba(34,48,43,.55)' }}>SpO₂</span>
                  <span style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>98.5%</span>
                  <svg viewBox="0 0 90 18" width="90" height="18" fill="none" stroke="#1d7a5f" strokeWidth="1.5"><path d="M0 12 L12 12 16 4 22 15 28 9 38 9 44 13 54 6 62 11 74 8 90 10" /></svg>
                </div>
                {nextAppointment && (
                  <div className="gl-chip" style={{ right: 14, bottom: 14, borderRadius: 14, padding: '10px 14px', gap: 10 }}>
                    <div className="gl-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{formatVisitDate(nextAppointment.scheduled_at)}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(34,48,43,.55)' }}>{nextAppointment.type}{nextAppointment.location ? ` · ${nextAppointment.location}` : ''}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right stack: time+doctor / calendar row, then upcoming visits below it */}
            <div style={{ flex: '1.4 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'stretch' }}>
                <div style={{ flex: '0.55 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div className="gl-panel" style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 300, fontVariantNumeric: 'tabular-nums' }}>{timeLabel}</div>
                  </div>
                  <div className="gl-panel" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 9, flex: 1 }}>
                    <div className="gl-avatar gl-avatar-lg" style={{ width: 60, height: 60, fontSize: 18, background: '#1d7a5f' }}>RO</div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>Dr. Rina Osei</div>
                      <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>Oncologist</div>
                    </div>
                    <Link className="gl-pill" style={{ width: '100%', marginTop: 'auto' }} to="/dashboard/care-team">Message</Link>
                  </div>
                </div>

                <div className="gl-panel" style={{ flex: '0.85 1 0%', minWidth: 0, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="gl-pill" style={{ padding: '5px 12px', fontSize: 11, cursor: 'default' }}>{monthLabel}</span>
                  </div>
                  <div className="gl-cal">
                    <span className="hd">SUN</span><span className="hd">MON</span><span className="hd">TUE</span><span className="hd">WED</span><span className="hd">THU</span><span className="hd">FRI</span><span className="hd">SAT</span>
                    {days.map((d, i) => <span key={i} className={`gl-day ${d.cls}`}>{d.n}</span>)}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>Upcoming visits</div>
                  <Link to="/dashboard/appointments" style={{ fontSize: 12, color: '#1d7a5f' }}>View all →</Link>
                </div>
                {upcomingAppointments.length === 0 ? (
                  <div className="gl-panel" style={{ padding: 16 }}>
                    <p style={{ fontSize: 12.5, color: 'rgba(34,48,43,.55)', margin: 0 }}>Nothing scheduled yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 12 }}>
                    {upcomingAppointments.slice(0, 3).map((a, i) => (
                      <div key={a.id} className="gl-panel gl-visit">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="gl-vicon" style={{ background: `color-mix(in srgb, ${VISIT_COLORS[i % 3]} 16%, transparent)`, color: VISIT_COLORS[i % 3] }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
                          </span>
                          <span className="gl-vdate">{formatVisitDate(a.scheduled_at)}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{a.type}</div>
                        {a.location && <span style={{ fontSize: 11, color: 'rgba(34,48,43,.55)', marginTop: 'auto' }}>{a.location}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="gl-panel" style={{ padding: 18 }}>
                <span className="gl-kicker">Journey</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Your treatment path</div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 14, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '6%', right: '6%', top: 6, height: 1, background: 'rgba(34,48,43,.15)' }} />
                  {JOURNEY_PHASES.map(({ label, state }) => (
                    <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                      <div style={{ width: state === 'current' ? 12 : 10, height: state === 'current' ? 12 : 10, borderRadius: '50%', background: state === 'current' ? '#1d7a5f' : state === 'past' ? 'rgba(29,122,95,.4)' : 'rgba(34,48,43,.2)' }} />
                      <span style={{ fontSize: 11, fontWeight: state === 'current' ? 600 : 400, color: state === 'current' ? '#1d7a5f' : 'rgba(34,48,43,.55)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gl-panel" style={{ padding: 18 }}>
                <span className="gl-kicker">Recent symptoms</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Symptom log</div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
                  {symptoms.length === 0 && <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)' }}>No symptoms logged yet.</p>}
                  {symptoms.slice(0, 3).map((s) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(34,48,43,.08)' }}>
                      <span style={{ flex: 1, fontSize: 14 }}>{s.symptom}</span>
                      <span className={SEVERITY_TAG[s.severity]}>{s.severity}</span>
                      <span style={{ fontSize: 12, color: 'rgba(34,48,43,.55)' }}>{s.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gl-panel" style={{ padding: 18, background: 'rgba(29,122,95,.08)' }}>
                <span className="gl-kicker">Ask Elpis</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Your AI assistant</div>
                <p style={{ fontSize: 13, opacity: .8, marginTop: 4 }}>Ask about symptoms, meds, or what's next — grounded in your own chart.</p>
                <Link className="gl-pill gl-pill-primary" style={{ width: '100%', marginTop: 8 }} to="/dashboard/assistant">Open assistant</Link>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="gl-panel" style={{ padding: 18 }}>
                <span className="gl-kicker">Today's medications</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{meds.filter((m) => m.done).length} of {meds.length} taken</div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
                  {meds.map((med) => (
                    <div key={med.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                      <span className={`gl-check${med.done ? ' done' : ''}`} onClick={() => toggleMed(med.id)}>
                        {med.done && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14 }}>{med.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{med.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gl-panel" style={{ padding: 18 }}>
                <span className="gl-kicker">Care team</span>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Reach your team</div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
                  {[
                    { id: 'osei', initials: 'RO', name: 'Dr. Rina Osei', role: 'Oncologist', color: '#1d7a5f' },
                    { id: 'tran', initials: 'JT', name: 'Jordan Tran, RN', role: 'Nurse Navigator', color: '#7a4fb8' },
                    { id: 'chen', initials: 'SC', name: 'Sam Chen', role: 'Caregiver', color: '#b5732a' },
                  ].map(({ id, initials, name, role, color }) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                      <div className="gl-avatar" style={{ background: color, width: 30, height: 30, fontSize: 11 }}>{initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(34,48,43,.55)' }}>{role}</div>
                      </div>
                      <Link className="gl-pill" style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }} to={`/dashboard/care-team?contact=${id}`} aria-label={`Message ${name}`}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 1 1-4-7.2" /><path d="M21 4v6h-6" /></svg>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
