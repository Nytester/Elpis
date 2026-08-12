import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const current = (path) => pathname === path ? 'page' : undefined;
  const [open, setOpen] = useState(false);

  // Close the mobile panel on route change and on resize back up to desktop
  // width, so it never gets stuck open behind a link click or an orientation
  // change.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="nav" style={{ paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-6)' }}>
      <Link to="/" className="nav-brand ep-logo">Elpis</Link>

      <button
        type="button"
        className="nav-burger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      <div className={`nav-links${open ? ' open' : ''}`}>
        <Link to="/" aria-current={current('/')}>Home</Link>
        <Link to="/hospital-finder" aria-current={current('/hospital-finder')}>Hospital Finder</Link>
        <Link to="/about" aria-current={current('/about')}>About</Link>
        <Link to="/prevention" aria-current={current('/prevention')}>Prevention</Link>
        <Link to="/blog" aria-current={pathname.startsWith('/blog') ? 'page' : undefined}>Blog</Link>
        <Link to="/pricing" aria-current={current('/pricing')}>Pricing</Link>
        <Link to="/contact" aria-current={current('/contact')}>Contact</Link>
        <div className="nav-actions">
          <Link className="btn btn-secondary" to="/login">Log in</Link>
          <Link className="btn btn-primary" to="/register">Get started</Link>
        </div>
      </div>
    </div>
  );
}
