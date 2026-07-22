import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

const LANGUAGES = ['English', 'Español', 'Tiếng Việt', 'Français'];

export default function ClaimInvite() {
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token');
  const navigate = useNavigate();
  const { session, signUp, signInWithGoogle, signOut } = useAuth();

  // The Google OAuth redirect drops the ?token= query param, so once we've seen
  // it once we persist it in sessionStorage and fall back to that on return.
  const [token] = useState(() => urlToken || sessionStorage.getItem('elpis_invite_token'));

  useEffect(() => {
    if (urlToken) sessionStorage.setItem('elpis_invite_token', urlToken);
  }, [urlToken]);

  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(true);

  const [claimStatus, setClaimStatus] = useState('idle'); // idle | claiming | claimed | error
  const [claimError, setClaimError] = useState('');
  const hasAttemptedClaim = useRef(false);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(LANGUAGES[0]);
  const [onboardingSaving, setOnboardingSaving] = useState(false);

  useEffect(() => {
    if (!token) { setLoadingPreview(false); return; }
    supabase.rpc('get_invite_preview', { invite_token: token }).then(({ data, error }) => {
      if (error || !data || data.length === 0) {
        setPreviewError('This invite link is invalid.');
      } else {
        const row = data[0];
        if (row.status === 'claimed') {
          setPreviewError('This invite has already been used.');
        } else if (row.status !== 'pending' || new Date(row.expires_at) < new Date()) {
          setPreviewError('This invite has expired. Please ask your care team to send a new one.');
        } else {
          setPreview(row);
        }
      }
      setLoadingPreview(false);
    });
  }, [token]);

  // Auto-claim the moment a session appears (either auth path lands here the same way)
  useEffect(() => {
    if (!session || !token || hasAttemptedClaim.current) return;
    hasAttemptedClaim.current = true;
    setClaimStatus('claiming');
    supabase.rpc('claim_patient_invite', { invite_token: token }).then(({ error }) => {
      if (error) {
        setClaimStatus('error');
        setClaimError(error.message);
      } else {
        sessionStorage.removeItem('elpis_invite_token');
        setClaimStatus('claimed');
      }
    });
  }, [session, token]);

  const handleGoogle = () => signInWithGoogle(`${window.location.origin}/claim`);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Enter your full name.';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    const { error } = await signUp({ email: preview.invited_email, password, fullName, role: 'patient' });
    if (error) {
      setSubmitting(false);
      setFormErrors({ form: error.message });
    }
    // on success, the auto-claim effect above fires once the session appears
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setOnboardingSaving(true);
    const { error } = await supabase.rpc('update_patient_contact_info', {
      new_phone: phone.trim() || null,
      new_emergency_contact_name: emergencyName.trim() || null,
      new_emergency_contact_phone: emergencyPhone.trim() || null,
      new_preferred_language: preferredLanguage,
    });
    setOnboardingSaving(false);
    if (!error) navigate('/dashboard');
  };

  const handleRetry = async () => {
    await signOut();
    hasAttemptedClaim.current = false;
    setClaimStatus('idle');
    setClaimError('');
  };

  if (!token) {
    return (
      <div className="ep-shell">
        <p className="text-muted">This link is missing an invite code. Please use the link from your invitation email.</p>
      </div>
    );
  }

  if (loadingPreview) {
    return <div className="ep-shell"><p className="text-muted">Loading invite…</p></div>;
  }

  if (previewError) {
    return (
      <div className="ep-shell">
        <Link to="/" className="ep-logo" style={{ fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
        <div className="card elev-md" style={{ padding: 'var(--space-6)', maxWidth: 440 }}>
          <p className="card-body">{previewError}</p>
        </div>
      </div>
    );
  }

  if (claimStatus === 'claimed') {
    return (
      <div className="ep-shell">
        <Link to="/" className="ep-logo" style={{ fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
        <form onSubmit={handleOnboardingSubmit} className="card elev-md" style={{ padding: 'var(--space-6)', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 24, textAlign: 'center' }}>Welcome to Elpis</h2>
          <p className="text-muted" style={{ textAlign: 'center', fontSize: 13 }}>Just a few details so your care team can reach you.</p>
          <div className="field">
            <label>Phone number</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
          </div>
          <div className="field">
            <label>Emergency contact name</label>
            <input className="input" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
          </div>
          <div className="field">
            <label>Emergency contact phone</label>
            <input className="input" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Preferred language</label>
            <select className="input" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={onboardingSaving}>
            {onboardingSaving ? 'Saving…' : 'Finish setup'}
          </button>
        </form>
      </div>
    );
  }

  if (claimStatus === 'claiming') {
    return <div className="ep-shell"><p className="text-muted">Setting up your account…</p></div>;
  }

  if (claimStatus === 'error') {
    return (
      <div className="ep-shell">
        <Link to="/" className="ep-logo" style={{ fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
        <div className="card elev-md" style={{ padding: 'var(--space-6)', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p className="card-body">{claimError}</p>
          <button className="btn btn-secondary btn-block" onClick={handleRetry}>Sign out and try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-shell">
      <Link to="/" className="ep-logo" style={{ fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
      <div className="card elev-md" style={{ padding: 'var(--space-6)', width: '100%', maxWidth: 440 }}>
        <h2 style={{ fontSize: 24, textAlign: 'center' }}>You've been invited</h2>
        <p className="text-muted" style={{ textAlign: 'center', fontSize: 14, marginTop: 4, marginBottom: 'var(--space-4)' }}>
          {preview.provider_name} has invited {preview.patient_first_name} to Elpis.
        </p>

        <button className="btn btn-secondary btn-block" onClick={handleGoogle} style={{ marginBottom: 'var(--space-3)' }}>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 'var(--space-3) 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
          <span className="text-muted" style={{ fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
        </div>

        <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {formErrors.form && <div className="ep-err">{formErrors.form}</div>}
          <div className="field">
            <label>Full name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            {formErrors.fullName && <div className="ep-err">{formErrors.fullName}</div>}
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={preview.invited_email} disabled />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {formErrors.password && <div className="ep-err">{formErrors.password}</div>}
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {formErrors.confirmPassword && <div className="ep-err">{formErrors.confirmPassword}</div>}
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
