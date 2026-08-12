import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import './dashboardGlass.css';

// Required, one-time step for patients who self-register via Google (no
// provider invite involved) — see patient_self_onboarding.sql for why this
// also has to exist: without it, these accounts have no patients row at all.
export default function PatientOnboarding() {
  const navigate = useNavigate();
  const { session, profile, loading, refreshProfile } = useAuth();

  const [checking, setChecking] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) { navigate('/login'); return; }
    if (profile?.role !== 'patient') { navigate(profile?.role === 'provider' ? '/provider' : '/dashboard'); return; }

    setFullName(profile.full_name || '');

    // Already onboarded (has a patients row)? Nothing to do here.
    supabase.from('patients').select('id').eq('profile_id', session.user.id).maybeSingle().then(({ data }) => {
      if (data) navigate('/dashboard');
      else setChecking(false);
    });
  }, [loading, session, profile, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Enter your full name.';
    if (!zip.trim() || !/^\d{5}$/.test(zip.trim())) errs.zip = 'Enter a valid 5-digit zip code.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const { error } = await supabase.rpc('complete_patient_self_onboarding', {
      p_full_name: fullName.trim(),
      p_phone: phone.trim() || null,
      p_address: address.trim() || null,
      p_zip: zip.trim(),
    });
    setSaving(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    await refreshProfile();
    navigate('/dashboard');
  }

  if (loading || checking) {
    return <div className="ep-shell gl-public gl-auth-bg"><p className="text-muted">Loading…</p></div>;
  }

  return (
    <div className="ep-shell gl-public gl-auth-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      <Link to="/" className="ep-logo" style={{ position: 'relative', zIndex: 1, fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
      <form onSubmit={handleSubmit} className="card ep-authcard-wide elev-md" style={{ position: 'relative', zIndex: 1, padding: 'var(--space-6)', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h2 style={{ fontSize: 24, textAlign: 'center' }}>Welcome to Elpis</h2>
        <p className="text-muted" style={{ textAlign: 'center', fontSize: 13 }}>Just a few details so we can set up your dashboard and connect you with a care team.</p>

        {errors.form && <div className="ep-err">{errors.form}</div>}

        <div className="field">
          <label>Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          {errors.fullName && <div className="ep-err">{errors.fullName}</div>}
        </div>
        <div className="field">
          <label>Phone number</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" />
        </div>
        <div className="field">
          <label>Address</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, state" />
        </div>
        <div className="field">
          <label>Zip code</label>
          <input className="input" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" placeholder="70115" />
          {errors.zip && <div className="ep-err">{errors.zip}</div>}
        </div>

        <p className="text-muted" style={{ fontSize: 12, marginTop: -4 }}>
          If you're joining through an invite from your care team, diagnosis and treatment details are already on file — you won't need to enter those here.
        </p>

        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Finish setup'}
        </button>
      </form>
    </div>
  );
}
