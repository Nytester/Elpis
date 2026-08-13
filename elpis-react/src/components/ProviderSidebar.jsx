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
  {
    label: 'Care Tasks', href: '/provider/tasks',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l2.5 2.5L15 9" /><rect x="3" y="4" width="18" height="17" rx="2.5" /><path d="M8 2.5v3M16 2.5v3" /></svg>,
  },
  {
    label: 'Appointments', href: '/provider/appointments',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  },
  {
    label: 'Settings', href: '/provider/settings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.4-1.6-2.8-2.3.9a7 7 0 0 0-1.8-1l-.3-2.4H10l-.3 2.4a7 7 0 0 0-1.8 1l-2.3-.9-1.6 2.8 2 1.4A7 7 0 0 0 5.8 12a7 7 0 0 0 .2 1.6l-2 1.4 1.6 2.8 2.3-.9a7 7 0 0 0 1.8 1l.3 2.4h4l.3-2.4a7 7 0 0 0 1.8-1l2.3.9 1.6-2.8-2-1.4c.13-.5.2-1 .2-1.6z" /></svg>,
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
      <Link to="/" className="ep-navitem" style={{ marginBottom: 'var(--space-4)' }} aria-label="Elpis home">
        <span className="ep-logo" style={{ fontSize: 20 }}>E</span>
        <span className="ep-navlabel">Elpis</span>
      </Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(({ label, href, icon }) => (
          <Link key={label} className={`ep-navitem${active === label ? ' active' : ''}`} to={href}>
            {icon}
            <span className="ep-navlabel">{label}</span>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
        <div className="ep-navitem" style={{ cursor: 'default' }}>
          <div className="ep-avatar">{initials}</div>
          <span className="ep-navlabel">{profile?.full_name} · Provider view</span>
        </div>
        <a href="/" onClick={handleExit} className="ep-navitem" aria-label="Exit">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
          <span className="ep-navlabel">Exit</span>
        </a>
      </div>
    </div>
  );
}
