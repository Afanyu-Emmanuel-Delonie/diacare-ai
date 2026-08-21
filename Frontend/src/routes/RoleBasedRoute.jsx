import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function RoleBasedRoute({ allowedRoles, children }) {
  const { userRole } = useAuth();
  const location = useLocation();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return children;
}

export default RoleBasedRoute;
