import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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

            <button type="button" className="btn btn-secondary btn-block" onClick={handleGoogle} style={{ marginBottom: 'var(--space-3)' }}>
              Continue with Google
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 'var(--space-3) 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
              <span className="text-muted" style={{ fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-divider)' }} />
            </div>

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
