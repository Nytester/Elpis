import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar.jsx';
import { useProviderRoster } from '../hooks/useProviderRoster.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';

const PHASE_TAG = { Treatment: 'tag-accent-2', Surveillance: 'tag-neutral', Survivorship: 'tag-outline' };
const PHASES = ['Treatment', 'Surveillance', 'Survivorship'];

function InvitePatientForm({ onDone }) {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [phase, setPhase] = useState(PHASES[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !age || !diagnosis.trim()) return;
    setSubmitting(true);
    setError('');

    const { data, error: rpcError } = await supabase.rpc('provider_create_patient_with_invite', {
      p_full_name: fullName.trim(),
      p_age: Number(age),
      p_diagnosis: diagnosis.trim(),
      p_phase: phase,
      p_invited_email: email.trim(),
      p_next_appointment_note: note.trim() || null,
    });

    if (rpcError || !data?.[0]) {
      setSubmitting(false);
      setError(rpcError?.message ?? 'Could not create patient record.');
      return;
    }

    const { invite_token } = data[0];
    const claimUrl = `${window.location.origin}/claim?token=${invite_token}`;

    const { error: sendError } = await supabase.functions.invoke('send-invite', {
      body: {
        invitedEmail: email.trim(),
        patientFirstName: fullName.trim().split(' ')[0],
        providerName: profile?.full_name,
        claimUrl,
      },
    });

    setSubmitting(false);
    setSuccess({ claimUrl, emailSent: !sendError });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(success.claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)', gap: 'var(--space-3)' }}>
        <span className="card-kicker">Invite sent</span>
        <p className="card-body" style={{ fontSize: 13 }}>
          {success.emailSent
            ? `An invite email was sent to ${email}.`
            : `Email delivery didn't go through, but the invite link below still works.`}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="input" readOnly value={success.claimUrl} style={{ flex: 1, minWidth: 220, fontSize: 12 }} />
          <button type="button" className="btn btn-secondary" onClick={handleCopy}>{copied ? 'Copied' : 'Copy link'}</button>
        </div>
        <button type="button" className="btn btn-primary btn-block" onClick={onDone}>Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card elev-sm" style={{ marginBottom: 'var(--space-4)', gap: 'var(--space-3)' }}>
      <span className="card-kicker">Invite a new patient</span>
      {error && <div className="ep-err">{error}</div>}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <input className="input" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ flex: 2, minWidth: 200 }} autoFocus />
        <input className="input" placeholder="Age" type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <input className="input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 2, minWidth: 200 }} />
        <select className="input" value={phase} onChange={(e) => setPhase(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
          {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <input className="input" placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
      <input className="input" placeholder="Next appointment note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting || !fullName.trim() || !email.trim() || !age || !diagnosis.trim()}>
          {submitting ? 'Sending invite…' : 'Send invite'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

export default function ProviderDashboard() {
  const { patients, loading } = useProviderRoster();
  const [showInvite, setShowInvite] = useState(false);
  const flagged = patients.filter((p) => p.alert);

  return (
    <div className="ep-shell-dash">
      <ProviderSidebar active="Patient Roster" />

      <div className="ep-main">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 400 }}>Patient Roster</h1>
            <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Oncology care team · {patients.length} active patients</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowInvite((s) => !s)}>+ Invite patient</button>
        </div>

        {showInvite && <InvitePatientForm onDone={() => setShowInvite(false)} />}

        {loading && <p className="text-muted" style={{ fontSize: 13 }}>Loading roster…</p>}

        {flagged.length > 0 && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>Needs attention</h2>
            <div className="ep-resource-grid">
              {flagged.map((p) => (
                <div key={p.id} className="card elev-sm" style={{ borderColor: 'var(--color-accent)' }}>
                  <span className="tag tag-accent" style={{ alignSelf: 'flex-start' }}>Alert</span>
                  <h3 className="card-title" style={{ fontSize: 15, marginTop: 4 }}>{p.full_name}</h3>
                  <p className="card-body" style={{ fontSize: 12 }}>{p.alert}</p>
                  <Link className="btn btn-secondary btn-block" to={`/provider/patients/${p.id}`}>View patient</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 'var(--space-3)' }}>All patients</h2>
            <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
              {patients.map((p) => (
                <div key={p.id} className="ep-doc-row">
                  <div className="ep-avatar">{p.full_name?.split(' ').map((w) => w[0]).join('')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14 }}>{p.full_name} <span className="text-muted" style={{ fontSize: 12 }}>· {p.age}</span></div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{p.diagnosis} · Last check-in: {p.last_check_in_note}</div>
                  </div>
                  <span className={`tag ${PHASE_TAG[p.phase]}`}>{p.phase}</span>
                  {p.invitePending && <span className="tag tag-outline">Invite pending</span>}
                  {p.pendingRefills > 0 && <span className="tag tag-neutral">{p.pendingRefills} refill{p.pendingRefills > 1 ? 's' : ''}</span>}
                  {p.alert && <span className="tag tag-accent">Alert</span>}
                  <Link className="btn btn-secondary" to={`/provider/patients/${p.id}`}>View</Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
