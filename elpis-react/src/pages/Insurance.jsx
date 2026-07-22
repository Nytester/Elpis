import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import { getSteps } from '../lib/authorizationSteps.js';

export default function Insurance() {
  const { authorizations } = usePatientData();

  return (
    <div className="ep-shell-dash">
      <Sidebar active="Insurance" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Insurance</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Track the status of authorization requests your care team has filed.</p>
        </div>

        {authorizations.length === 0 && (
          <p className="text-muted" style={{ fontSize: 13 }}>No authorization requests on file yet.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {authorizations.map((a) => (
            <div key={a.id} className="card elev-sm">
              <span className="card-kicker">{a.submitted_date}</span>
              <h3 className="card-title" style={{ fontSize: 17, marginTop: 4 }}>{a.procedure}</h3>

              <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 'var(--space-4)', position: 'relative', padding: '0 var(--space-2)', maxWidth: 360 }}>
                <div style={{ position: 'absolute', left: '10%', right: '10%', top: 6, height: 1, background: 'var(--color-divider)' }} />
                {getSteps(a.status).map((s) => (
                  <div key={s.label} className="ep-step">
                    <div className={`ep-dot${s.state ? ' ' + s.state : ''}`} />
                    <span style={{ fontSize: 12, fontWeight: s.state === 'current' ? 600 : 400, color: s.state === 'current' ? 'var(--color-accent-700)' : 'var(--color-neutral-600)' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {a.decision_date && (
                <p className="text-muted" style={{ fontSize: 12, marginTop: 'var(--space-2)' }}>Decided {a.decision_date}</p>
              )}

              {a.at_risk_note && !['approved', 'denied'].includes(a.status) && (
                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
                  <span className="tag tag-accent" style={{ marginBottom: 4 }}>May affect your care</span>
                  <p className="card-body" style={{ fontSize: 13 }}>{a.at_risk_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
