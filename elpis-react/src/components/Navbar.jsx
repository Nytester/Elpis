import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const current = (path) => pathname === path ? 'page' : undefined;

  return (
    <div className="nav" style={{ paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-6)' }}>
      <Link to="/" className="nav-brand ep-logo">Elpis</Link>
      <Link to="/" aria-current={current('/')}>Home</Link>
      <Link to="/hospital-finder" aria-current={current('/hospital-finder')}>Hospital Finder</Link>
      <Link to="/about" aria-current={current('/about')}>About</Link>
      <Link to="/prevention" aria-current={current('/prevention')}>Prevention</Link>
      <Link to="/blog" aria-current={pathname.startsWith('/blog') ? 'page' : undefined}>Blog</Link>
      <Link to="/pricing" aria-current={current('/pricing')}>Pricing</Link>
      <Link to="/contact" aria-current={current('/contact')}>Contact</Link>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'var(--space-4)' }}>
        <Link className="btn btn-secondary" to="/login">Log in</Link>
        <Link className="btn btn-primary" to="/register">Get started</Link>
      </div>
    </div>
  );
}
