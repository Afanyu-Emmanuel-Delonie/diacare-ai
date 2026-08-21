import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing, sessionExpired } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    if (sessionExpired) {
      return <Navigate to="/session-expired" replace state={{ from: location }} />;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
