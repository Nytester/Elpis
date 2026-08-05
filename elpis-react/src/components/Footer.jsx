import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="ep-container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 'var(--space-6)' }}>
      <div>
        <div className="nav-brand ep-logo" style={{ marginBottom: 'var(--space-2)' }}>Elpis</div>
        <p className="text-muted" style={{ fontSize: 13, maxWidth: '32ch' }}>Care coordination for cancer patients, caregivers and their providers.</p>
      </div>
      <div>
        <h6 style={{ marginBottom: 'var(--space-3)' }}>Product</h6>
        <Link className="ep-footlink" to="/how-it-works#dashboard">Dashboard</Link>
        <Link className="ep-footlink" to="/how-it-works#ai-assistant">AI Assistant</Link>
        <Link className="ep-footlink" to="/pricing">Pricing</Link>
      </div>
      <div>
        <h6 style={{ marginBottom: 'var(--space-3)' }}>Company</h6>
        <Link className="ep-footlink" to="/about">About</Link>
        <Link className="ep-footlink" to="/contact">Contact</Link>
      </div>
      <div>
        <h6 style={{ marginBottom: 'var(--space-3)' }}>Account</h6>
        <Link className="ep-footlink" to="/login">Log in</Link>
        <Link className="ep-footlink" to="/register">Register</Link>
      </div>
    </div>
  );
}
