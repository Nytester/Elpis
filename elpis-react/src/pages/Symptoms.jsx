import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';

const COMMON_SYMPTOMS = ['Fatigue', 'Nausea', 'Appetite loss', 'Neuropathy (tingling)', 'Pain', 'Fever', 'Other'];
const SEVERITIES = ['Mild', 'Moderate', 'Severe'];
const SEVERITY_TAG = { Mild: 'tag-neutral', Moderate: 'tag-accent-2', Severe: 'tag-accent' };

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
    <div className="ep-shell-dash">
      <Sidebar active="Symptoms" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Symptoms</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Log how you're feeling so your care team can spot patterns.</p>
        </div>

        <form onSubmit={handleSubmit} className="card elev-sm" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-3)' }}>
          <span className="card-kicker">Log a symptom</span>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <select className="input" value={symptom} onChange={(e) => setSymptom(e.target.value)} style={{ flex: 1, minWidth: 180 }}>
              {COMMON_SYMPTOMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="seg">
              {SEVERITIES.map((s) => (
                <span key={s} className={`seg-opt${severity === s ? ' selected' : ''}`} onClick={() => setSeverity(s)}>{s}</span>
              ))}
            </div>
          </div>
          <textarea
            className="input"
            placeholder="Notes (optional) — what helped, what made it worse, anything to mention to your care team..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Log symptom</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>History</h2>
          <div className="seg">
            {['All', ...SEVERITIES].map((s) => (
              <span key={s} className={`seg-opt${severityFilter === s ? ' selected' : ''}`} onClick={() => setSeverityFilter(s)}>{s}</span>
            ))}
          </div>
        </div>

        <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
          {visibleLog.length === 0 && (
            <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>No symptoms logged at this severity.</p>
          )}
          {visibleLog.map((entry) => (
            <div key={entry.id} className="ep-medrow" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{entry.symptom}</div>
                {entry.notes && <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{entry.notes}</div>}
              </div>
              <span className={`tag ${SEVERITY_TAG[entry.severity]}`}>{entry.severity}</span>
              <span className="text-muted" style={{ fontSize: 12, minWidth: 70, textAlign: 'right' }}>{entry.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
