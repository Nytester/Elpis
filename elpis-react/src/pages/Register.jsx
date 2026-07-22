import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { signUp, session, profile } = useAuth();
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    if (session && profile) navigate(profile.role === 'provider' ? '/provider' : '/dashboard');
  }, [session, profile, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.';
    if (!agreed) errs.agreed = 'Please agree to continue.';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName, role });
      if (error) {
        setSubmitting(false);
        setErrors({ form: error.message });
      }
      // on success, the useEffect above redirects once the session + profile land
    }
  }

  return (
    <div className="ep-shell">
      <Link to="/" className="ep-logo" style={{ fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
      <div className="card elev-md" style={{ padding: 'var(--space-6)', width: '100%', maxWidth: 440 }}>
        {!submitting ? (
          <>
            <h2 style={{ fontSize: 26, textAlign: 'center' }}>Create your account</h2>
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 4, marginBottom: 'var(--space-4)' }}>Free for patients and caregivers.</p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} onSubmit={handleSubmit}>
              {errors.form && <div className="ep-err">{errors.form}</div>}
              <div className="field">
                <label>I am a</label>
                <div className="seg" style={{ width: '100%' }}>
                  <label className={`seg-opt${role === 'patient' ? ' selected' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRole('patient')}>
                    <input type="radio" name="role" readOnly checked={role === 'patient'} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                    <span>Patient</span>
                  </label>
                  <label className={`seg-opt${role === 'caregiver' ? ' selected' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRole('caregiver')}>
                    <input type="radio" name="role" readOnly checked={role === 'caregiver'} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                    <span>Caregiver</span>
                  </label>
                </div>
              </div>
              <div className="field">
                <label>Full name</label>
                <input className="input" type="text" value={form.fullName} onChange={set('fullName')} />
                {errors.fullName && <div className="ep-err">{errors.fullName}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input className="input" type="text" value={form.email} onChange={set('email')} />
                {errors.email && <div className="ep-err">{errors.email}</div>}
              </div>
              <div className="field">
                <label>Password</label>
                <input className="input" type="password" value={form.password} onChange={set('password')} />
                {errors.password && <div className="ep-err">{errors.password}</div>}
              </div>
              <div className="field">
                <label>Confirm password</label>
                <input className="input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} />
                {errors.confirmPassword && <div className="ep-err">{errors.confirmPassword}</div>}
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>I agree to the Terms and Privacy Policy</span>
              </label>
              {errors.agreed && <div className="ep-err">{errors.agreed}</div>}
              <button className="btn btn-primary btn-block" type="submit">Create account</button>
            </form>
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 'var(--space-4)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--color-accent-700)' }}>Log in</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            <span className="card-kicker">Welcome, {form.fullName}</span>
            <h3 className="card-title" style={{ marginTop: 'var(--space-2)' }}>Setting up your dashboard…</h3>
          </div>
        )}
      </div>
    </div>
  );
}
