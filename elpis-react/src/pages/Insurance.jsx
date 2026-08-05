import { useRef, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { usePatientData } from '../context/PatientDataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useInsuranceDocuments } from '../hooks/useInsuranceDocuments.js';
import { useInsuranceCoverage } from '../hooks/useInsuranceCoverage.js';
import { useCareTasks } from '../hooks/useCareTasks.js';
import { getSteps } from '../lib/authorizationSteps.js';

const CATEGORY_LABEL = {
  insurance_card: 'Insurance Card',
  eob: 'Explanation of Benefits',
  denial_letter: 'Denial Letter',
  appeal: 'Appeal',
  other: 'Other',
};
const CATEGORY_TAG = {
  insurance_card: 'tag-accent',
  eob: 'tag-neutral',
  denial_letter: 'tag-accent-2',
  appeal: 'tag-accent-2',
  other: 'tag-outline',
};

// General, non-personalized guidance — not fabricated specifics about any
// patient's actual claim, just the standard steps most payers require.
const APPEAL_CHECKLIST = [
  'Read the denial letter fully — it must state the specific reason and cite the plan provision or clinical policy used.',
  "Confirm the appeal deadline (often 30–180 days from the denial date, plan-dependent) and whether an expedited appeal applies given your treatment timeline.",
  'Gather supporting records: the denial letter, relevant chart notes, prior authorization request, and any letter of medical necessity from your oncologist.',
  "Request a copy of the clinical criteria the payer used — you're generally entitled to this and it's necessary to address it directly.",
  'Submit a written appeal referencing the denial reason point by point, attaching supporting documents — a general "please reconsider" letter is unlikely to succeed.',
  "If denied again, ask your care team about external review — many plans (and state law) allow an independent reviewer outside the insurer once internal appeals are exhausted.",
];

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMoney(n) {
  if (n === null || n === undefined || n === '') return null;
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h9l4 4v16H6z" /><path d="M15 2v4h4M9 13h6M9 17h6" />
    </svg>
  );
}

function CoverageSummary({ patientId }) {
  const { coverage, loading, saveCoverage } = useInsuranceCoverage(patientId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ plan_name: '', member_id: '', deductible_total: '', deductible_met: '', oop_max_total: '', oop_met: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setForm({
      plan_name: coverage?.plan_name ?? '',
      member_id: coverage?.member_id ?? '',
      deductible_total: coverage?.deductible_total ?? '',
      deductible_met: coverage?.deductible_met ?? '',
      oop_max_total: coverage?.oop_max_total ?? '',
      oop_met: coverage?.oop_met ?? '',
      notes: coverage?.notes ?? '',
    });
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCoverage({
        plan_name: form.plan_name.trim() || null,
        member_id: form.member_id.trim() || null,
        deductible_total: form.deductible_total === '' ? null : Number(form.deductible_total),
        deductible_met: form.deductible_met === '' ? null : Number(form.deductible_met),
        oop_max_total: form.oop_max_total === '' ? null : Number(form.oop_max_total),
        oop_met: form.oop_met === '' ? null : Number(form.oop_met),
        notes: form.notes.trim() || null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  if (editing) {
    return (
      <form onSubmit={handleSave} className="card elev-sm" style={{ marginBottom: 'var(--space-6)', gap: 'var(--space-3)' }}>
        <span className="card-kicker">Coverage summary</span>
        <p className="text-muted" style={{ fontSize: 12.5, margin: 0 }}>Enter what's on your insurance card or plan documents — nothing here is looked up automatically.</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <input className="input" placeholder="Plan name" value={form.plan_name} onChange={(e) => setForm((f) => ({ ...f, plan_name: e.target.value }))} style={{ flex: 2, minWidth: 200 }} />
          <input className="input" placeholder="Member ID" value={form.member_id} onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))} style={{ flex: 1, minWidth: 160 }} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <input className="input" type="number" step="0.01" placeholder="Deductible total ($)" value={form.deductible_total} onChange={(e) => setForm((f) => ({ ...f, deductible_total: e.target.value }))} style={{ flex: 1, minWidth: 160 }} />
          <input className="input" type="number" step="0.01" placeholder="Deductible met ($)" value={form.deductible_met} onChange={(e) => setForm((f) => ({ ...f, deductible_met: e.target.value }))} style={{ flex: 1, minWidth: 160 }} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <input className="input" type="number" step="0.01" placeholder="Out-of-pocket max ($)" value={form.oop_max_total} onChange={(e) => setForm((f) => ({ ...f, oop_max_total: e.target.value }))} style={{ flex: 1, minWidth: 160 }} />
          <input className="input" type="number" step="0.01" placeholder="Out-of-pocket met ($)" value={form.oop_met} onChange={(e) => setForm((f) => ({ ...f, oop_met: e.target.value }))} style={{ flex: 1, minWidth: 160 }} />
        </div>
        <textarea className="input" placeholder="Notes — cancer-specific coverage details, referral requirements, etc. (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  if (!coverage) {
    return (
      <div className="card elev-sm" style={{ marginBottom: 'var(--space-6)' }}>
        <span className="card-kicker">Coverage summary</span>
        <p className="card-body">Add your plan name, deductible, and out-of-pocket max so it's on hand for your care team and any billing question.</p>
        <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={startEditing}>+ Add coverage details</button>
      </div>
    );
  }

  const deductiblePct = coverage.deductible_total ? Math.min(100, Math.round((coverage.deductible_met / coverage.deductible_total) * 100)) : null;
  const oopPct = coverage.oop_max_total ? Math.min(100, Math.round((coverage.oop_met / coverage.oop_max_total) * 100)) : null;

  return (
    <div className="card elev-sm" style={{ marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <span className="card-kicker">Coverage summary</span>
          <h3 className="card-title" style={{ fontSize: 18, marginTop: 4 }}>{coverage.plan_name || 'Your plan'}</h3>
          {coverage.member_id && <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>Member ID {coverage.member_id}</p>}
        </div>
        <button className="btn btn-secondary" onClick={startEditing}>Edit</button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
        {coverage.deductible_total != null && (
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deductible</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{formatMoney(coverage.deductible_met ?? 0)} <span className="text-muted" style={{ fontWeight: 400, fontSize: 13 }}>of {formatMoney(coverage.deductible_total)}</span></div>
            {deductiblePct != null && (
              <div style={{ height: 5, borderRadius: 3, background: 'var(--color-divider)', marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${deductiblePct}%`, background: 'var(--color-accent)' }} />
              </div>
            )}
          </div>
        )}
        {coverage.oop_max_total != null && (
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Out-of-pocket max</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{formatMoney(coverage.oop_met ?? 0)} <span className="text-muted" style={{ fontWeight: 400, fontSize: 13 }}>of {formatMoney(coverage.oop_max_total)}</span></div>
            {oopPct != null && (
              <div style={{ height: 5, borderRadius: 3, background: 'var(--color-divider)', marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${oopPct}%`, background: 'var(--color-accent)' }} />
              </div>
            )}
          </div>
        )}
      </div>

      {coverage.notes && <p className="card-body" style={{ marginTop: 'var(--space-3)' }}>{coverage.notes}</p>}
      <p className="text-muted" style={{ fontSize: 11, marginTop: 'var(--space-3)' }}>Last updated {new Date(coverage.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · self-reported, not pulled from your payer</p>
    </div>
  );
}

function NeedHelpButton({ patientId, authorizationId }) {
  const { tasks, createTask } = useCareTasks(patientId);
  const [sent, setSent] = useState(false);
  const existing = tasks.find((t) => t.authorization_id === authorizationId && t.status !== 'done');

  const handleClick = async () => {
    await createTask({ authorizationId, note: 'Requested help with an authorization/claim' });
    setSent(true);
  };

  if (existing || sent) {
    return <span className="tag tag-neutral" style={{ marginTop: 'var(--space-3)' }}>Your care team has been notified</span>;
  }
  return (
    <button className="btn btn-secondary" style={{ marginTop: 'var(--space-3)' }} onClick={handleClick}>Need help with this?</button>
  );
}

function DocumentUploader({ patientId, authorizations, session }) {
  const { docs, urls, loading, uploadDocument, deleteDocument } = useInsuranceDocuments(patientId);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('insurance_card');
  const [authorizationId, setAuthorizationId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
    setName('');
    setCategory('insurance_card');
    setAuthorizationId('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError('');
    try {
      await uploadDocument({ file, name, category, authorizationId: authorizationId || null });
      resetForm();
      setShowUpload(false);
    } catch (err) {
      setError(err.message ?? 'Upload failed — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Insurance documents</h2>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Insurance cards, EOBs, denial letters, and appeal paperwork — stored securely, visible to you and your care team.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload((s) => !s)}>+ Upload document</button>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="card elev-sm" style={{ marginBottom: 'var(--space-4)', gap: 'var(--space-3)' }}>
          <span className="card-kicker">New document</span>
          {error && <div className="ep-err">{error}</div>}
          <input
            ref={fileInputRef}
            className="input"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Document name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 2, minWidth: 200 }}
            />
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
              {Object.entries(CATEGORY_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
            {authorizations.length > 0 && (
              <select className="input" value={authorizationId} onChange={(e) => setAuthorizationId(e.target.value)} style={{ flex: 1, minWidth: 200 }}>
                <option value="">Not tied to a specific request</option>
                {authorizations.map((a) => <option key={a.id} value={a.id}>{a.procedure}</option>)}
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn btn-primary" disabled={!file || submitting}>{submitting ? 'Uploading…' : 'Upload'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => { resetForm(); setShowUpload(false); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-3)' }}>
        {!loading && docs.length === 0 && (
          <p className="text-muted" style={{ fontSize: 13, padding: 'var(--space-3) 0' }}>No insurance documents uploaded yet.</p>
        )}
        {docs.map((doc) => (
          <div key={doc.id} className="ep-doc-row">
            <div className="ep-doc-icon"><DocIcon /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14 }}>{doc.name}</div>
              <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {formatSize(doc.size_bytes)}</div>
            </div>
            <span className={`tag ${CATEGORY_TAG[doc.category]}`}>{CATEGORY_LABEL[doc.category]}</span>
            {urls[doc.file_path] && (
              <a className="btn btn-icon btn-ghost" href={urls[doc.file_path]} target="_blank" rel="noopener noreferrer" aria-label={`View ${doc.name}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
              </a>
            )}
            {doc.uploaded_by === session?.user?.id && (
              <button className="btn btn-icon btn-ghost" onClick={() => deleteDocument(doc)} aria-label={`Delete ${doc.name}`}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AppealChecklist() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card elev-sm" style={{ marginTop: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="card-kicker">If something is denied</span>
          <h3 className="card-title" style={{ fontSize: 17, marginTop: 4 }}>Denial &amp; appeal checklist</h3>
        </div>
        <button className="btn btn-secondary" onClick={() => setOpen((o) => !o)}>{open ? 'Hide' : 'Show checklist'}</button>
      </div>
      {open && (
        <ol style={{ marginTop: 'var(--space-3)', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {APPEAL_CHECKLIST.map((step) => (
            <li key={step} style={{ fontSize: 13.5, lineHeight: 1.5 }}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function Insurance() {
  const { patientId, authorizations } = usePatientData();
  const { session } = useAuth();

  return (
    <div className="ep-shell-dash">
      <Sidebar active="Insurance" />

      <div className="ep-main">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 30, fontWeight: 400 }}>Insurance</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>Track the status of authorization requests your care team has filed.</p>
        </div>

        {patientId && <CoverageSummary patientId={patientId} />}

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
              {a.updated_at && (
                <p className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>Last updated {new Date(a.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              )}

              {a.at_risk_note && !['approved', 'denied'].includes(a.status) && (
                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
                  <span className="tag tag-accent" style={{ marginBottom: 4 }}>May affect your care</span>
                  <p className="card-body" style={{ fontSize: 13 }}>{a.at_risk_note}</p>
                </div>
              )}

              {patientId && !['approved'].includes(a.status) && (
                <NeedHelpButton patientId={patientId} authorizationId={a.id} />
              )}
            </div>
          ))}
        </div>

        <AppealChecklist />

        {patientId && <DocumentUploader patientId={patientId} authorizations={authorizations} session={session} />}
      </div>
    </div>
  );
}
