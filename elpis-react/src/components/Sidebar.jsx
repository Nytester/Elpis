import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  {
    label: 'Dashboard', href: '/dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
  },
  {
    label: 'Journey Timeline', href: '/dashboard/journey',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>,
  },
  {
    label: 'Appointments', href: '/dashboard/appointments',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  },
  {
    label: 'AI Assistant', href: '/dashboard/assistant',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 1 1-4-7.2" /><path d="M21 4v6h-6" /><circle cx="12" cy="12" r="0.5" /></svg>,
  },
  {
    label: 'Symptoms', href: '/dashboard/symptoms',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /><path d="M3.5 12h4l1.5-3 2 5 1.5-2.5h7.5" /></svg>,
  },
  {
    label: 'Medications', href: '/dashboard/medications',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 14)" /><path d="M8.5 9.5l6 6" /></svg>,
  },
  {
    label: 'Documents', href: '/dashboard/documents',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l4 4v16H6z" /><path d="M15 2v4h4M9 13h6M9 17h6" /></svg>,
  },
  {
    label: 'Care Team', href: '/dashboard/care-team',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17.5" cy="9" r="2.3" /><path d="M15.8 14.7c2.6.4 4.2 2.2 4.2 5.3" /></svg>,
  },
  {
    label: 'Hope', href: '/dashboard/hope',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>,
  },
  {
    label: 'Transportation', href: '/dashboard/transportation',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16V8a2 2 0 0 1 2-2h11l4 4v6" /><path d="M3 16h17M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>,
  },
  {
    label: 'Resources', href: '/dashboard/resources',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /></svg>,
  },
  {
    label: 'Insurance', href: '/dashboard/insurance',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  },
  {
    label: 'Settings', href: '/dashboard/settings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.4-1.6-2.8-2.3.9a7 7 0 0 0-1.8-1l-.3-2.4H10l-.3 2.4a7 7 0 0 0-1.8 1l-2.3-.9-1.6 2.8 2 1.4A7 7 0 0 0 5.8 12a7 7 0 0 0 .2 1.6l-2 1.4 1.6 2.8 2.3-.9a7 7 0 0 0 1.8 1l.3 2.4h4l.3-2.4a7 7 0 0 0 1.8-1l2.3.9 1.6-2.8-2-1.4c.13-.5.2-1 .2-1.6z" /></svg>,
  },
];

export default function Sidebar({ active }) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const initials = profile?.full_name ? profile.full_name.split(' ').map((w) => w[0]).join('') : '';

  const handleLogout = async (e) => {
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
          href === '#' ? (
            <a key={label} className={`ep-navitem${active === label ? ' active' : ''}`} href={href}>
              {icon}
              <span className="ep-navlabel">{label}</span>
            </a>
          ) : (
            <Link key={label} className={`ep-navitem${active === label ? ' active' : ''}`} to={href}>
              {icon}
              <span className="ep-navlabel">{label}</span>
            </Link>
          )
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
        <div className="ep-navitem" style={{ cursor: 'default' }}>
          <div className="ep-avatar">{initials}</div>
          <span className="ep-navlabel">{profile?.full_name}{profile?.role ? ` · ${profile.role}` : ''}</span>
        </div>
        <a href="/" onClick={handleLogout} className="ep-navitem" aria-label="Log out">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
          <span className="ep-navlabel">Log out</span>
        </a>
      </div>
    </div>
  );
}
