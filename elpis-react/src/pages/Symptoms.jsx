import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import './dashboardGlass.css';

const COMMON_SYMPTOMS = ['Fatigue', 'Nausea', 'Appetite loss', 'Neuropathy (tingling)', 'Pain', 'Fever', 'Other'];
const SEVERITIES = ['Mild', 'Moderate', 'Severe'];
const SEVERITY_TAG = { Mild: 'gl-tag-mild', Moderate: 'gl-tag-moderate', Severe: 'gl-tag-severe' };

export default function Symptoms() {
  const { symptoms: log, logSymptom } = usePatientData();
  const [severityFilter, setSeverityFilter] = useState('All');
  const [symptom, setSymptom] = useState(COMMON_SYMPTOMS[0]);
  const [severity, setSeverity] = useState('Mild');
  const [notes, setNotes] = useState('');

  const visibleLog = severityFilter === 'All' ? log : log.filter((e) => e.severity === severityFilter);

  const handleSubmit = (e) => {
    e.preventDefault();
    logSymptom({ symptom, severity, notes: notes.trim() });
    setNotes('');
  };

  return (
    <div className="ep-shell-dash gl-shell">
      <Sidebar active="Symptoms" />

      <div className="ep-main">
        <div className="gl-dash">
          <div style={{ marginBottom: 20 }}>
            <h1 className="gl-greeting">Symptoms</h1>
            <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', marginTop: 4 }}>Log how you're feeling so your care team can spot patterns.</p>
          </div>

          <form onSubmit={handleSubmit} className="gl-panel" style={{ padding: 18, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="gl-kicker">Log a symptom</span>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <select className="gl-input" value={symptom} onChange={(e) => setSymptom(e.target.value)} style={{ flex: 1, minWidth: 180 }}>
                {COMMON_SYMPTOMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="gl-seg">
                {SEVERITIES.map((s) => (
                  <span key={s} className={`gl-seg-opt${severity === s ? ' selected' : ''}`} onClick={() => setSeverity(s)}>{s}</span>
                ))}
              </div>
            </div>
            <textarea
              className="gl-input"
              placeholder="Notes (optional) — what helped, what made it worse, anything to mention to your care team..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button type="submit" className="gl-pill gl-pill-primary" style={{ alignSelf: 'flex-start', border: 'none' }}>Log symptom</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>History</div>
            <div className="gl-seg">
              {['All', ...SEVERITIES].map((s) => (
                <span key={s} className={`gl-seg-opt${severityFilter === s ? ' selected' : ''}`} onClick={() => setSeverityFilter(s)}>{s}</span>
              ))}
            </div>
          </div>

          <div className="gl-panel" style={{ padding: '4px 16px' }}>
            {visibleLog.length === 0 && (
              <p style={{ fontSize: 13, color: 'rgba(34,48,43,.55)', padding: '14px 0' }}>No symptoms logged at this severity.</p>
            )}
            {visibleLog.map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(34,48,43,.08)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{entry.symptom}</div>
                  {entry.notes && <div style={{ fontSize: 12, color: 'rgba(34,48,43,.55)', marginTop: 2 }}>{entry.notes}</div>}
                </div>
                <span className={`gl-tag ${SEVERITY_TAG[entry.severity]}`}>{entry.severity}</span>
                <span style={{ fontSize: 12, color: 'rgba(34,48,43,.55)', minWidth: 70, textAlign: 'right' }}>{entry.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
