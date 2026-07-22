import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireRole({ roles, children }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div className="ep-shell"><p className="text-muted">Loading…</p></div>;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (!roles.includes(profile?.role)) {
    return <Navigate to={profile?.role === 'provider' ? '/provider' : '/dashboard'} replace />;
  }
  return children;
}
