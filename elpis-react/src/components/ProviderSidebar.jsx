import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  {
    label: 'Patient Roster', href: '/provider',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17.5" cy="9" r="2.3" /><path d="M15.8 14.7c2.6.4 4.2 2.2 4.2 5.3" /></svg>,
  },
  {
    label: 'Inbox', href: '/provider/inbox',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 1 1-4-7.2" /><path d="M21 4v6h-6" /></svg>,
  },
];

export default function ProviderSidebar({ active }) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const initials = profile?.full_name ? profile.full_name.split(' ').map((w) => w[0]).join('') : '';

  const handleExit = async (e) => {
    e.preventDefault();
    await signOut();
    navigate('/');
  };

  return (
    <div className="ep-sidebar">
      <Link to="/" className="ep-logo" style={{ padding: '0 10px', marginBottom: 'var(--space-4)', textDecoration: 'none', fontSize: 22 }}>Elpis</Link>
      <div style={{ padding: '0 10px', marginBottom: 'var(--space-4)' }}>
        <span className="tag tag-outline">Provider view</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ label, href, icon }) => (
          <Link key={label} className={`ep-navitem${active === label ? ' active' : ''}`} to={href}>
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderTop: '1px solid var(--color-divider)' }}>
        <div className="ep-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.full_name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>Oncologist</div>
        </div>
        <a href="/" onClick={handleExit} style={{ fontSize: 12, color: 'var(--color-neutral-600)', cursor: 'pointer' }}>Exit</a>
      </div>
    </div>
  );
}
