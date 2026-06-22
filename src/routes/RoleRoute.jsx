import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { canAccessRole } from '../utils/roleUtils';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { authLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <Loader minHeight="100vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessRole(user?.role, allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children || <Outlet />;
};

export default RoleRoute;
