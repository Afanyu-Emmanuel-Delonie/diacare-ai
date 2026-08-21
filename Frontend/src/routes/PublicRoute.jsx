import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { getDashboardPath } from '../utils/roles.js';

function PublicRoute({ children }) {
  const { isAuthenticated, isInitializing, userRole } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
}

export default PublicRoute;
