import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" style={{ flex: 'none' }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}
export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, session, profile } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    if (session && profile) navigate(profile.role === 'provider' ? '/provider' : '/dashboard');
  }, [session, profile, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      const { error } = await signIn({ email: form.email, password: form.password });
      if (error) {
        setSubmitting(false);
        setErrors({ form: error.message });
      }
      // on success, the useEffect above redirects once the session + profile land
    }
  }

  const handleGoogle = () => signInWithGoogle(`${window.location.origin}/login`);

  return (
    <div className="ep-shell">
      <Link to="/" className="ep-logo" style={{ fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
      <div className="ep-authcard card elev-md" style={{ padding: 'var(--space-6)' }}>
        {!submitting ? (
          <>
            <h2 style={{ fontSize: 26, textAlign: 'center' }}>Welcome back</h2>
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 4, marginBottom: 'var(--space-4)' }}>Log in to your Elpis account.</p>
            
            

            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} onSubmit={handleSubmit}>
              {errors.form && <div className="ep-err">{errors.form}</div>}
              <div className="field">
                <label>Email</label>
                <input className="input" type="text" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                {errors.email && <div className="ep-err">{errors.email}</div>}
              </div>
              <div className="field">
                <label>Password</label>
                <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
                {errors.password && <div className="ep-err">{errors.password}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>Forgot password?</Link>
              </div>
              <button className="btn btn-primary btn-block" type="submit">Log in</button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 'var(--space-3) 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
              <span className="text-muted" style={{ fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
            </div>

            <button type="button" className="btn btn-secondary btn-block" onClick={handleGoogle} style={{ marginBottom: 'var(--space-3)' }}><GoogleIcon />
              Continue with Google
            </button>
            
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 'var(--space-4)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent-700)' }}>Register</Link>
            </p>
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 'var(--space-2)' }}>
              Care team member? <Link to="/provider" style={{ color: 'var(--color-accent-700)' }}>View provider dashboard</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            <span className="card-kicker">Signed in</span>
            <h3 className="card-title" style={{ marginTop: 'var(--space-2)' }}>Taking you to your dashboard…</h3>
          </div>
        )}
      </div>
    </div>
  );
}
