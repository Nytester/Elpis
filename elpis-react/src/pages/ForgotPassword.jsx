import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="ep-shell">
      <Link to="/" className="ep-logo" style={{ fontSize: 26, marginBottom: 'var(--space-6)', textDecoration: 'none' }}>Elpis</Link>
      <div className="card elev-md" style={{ padding: 'var(--space-6)', width: '100%', maxWidth: 400 }}>
        {!submitted ? (
          <>
            <h2 style={{ fontSize: 26, textAlign: 'center' }}>Reset your password</h2>
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 4, marginBottom: 'var(--space-4)' }}>Enter your email and we'll send a reset link.</p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} onSubmit={handleSubmit}>
              <div className="field">
                <label>Email</label>
                <input className="input" type="text" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" />
                {error && <div className="ep-err">{error}</div>}
              </div>
              <button className="btn btn-primary btn-block" type="submit">Send reset link</button>
            </form>
            <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 'var(--space-4)' }}>
              <Link to="/login" style={{ color: 'var(--color-accent-700)' }}>‹ Back to log in</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
            <span className="card-kicker">Check your inbox</span>
            <h3 className="card-title" style={{ marginTop: 'var(--space-2)' }}>We sent a link to {email}</h3>
            <p className="card-body" style={{ marginTop: 'var(--space-2)' }}>Follow the link to choose a new password. Didn't get it? Check spam, or try again.</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-secondary" onClick={() => {}}>Resend link</button>
              <Link className="btn btn-primary" to="/login">Back to log in</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
