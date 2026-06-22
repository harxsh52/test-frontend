import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { authLoading, isAuthenticated, sessionExpired } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <Loader minHeight="100vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location, reason: sessionExpired ? 'SESSION_EXPIRED' : null }} />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
