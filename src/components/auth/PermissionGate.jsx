import { useAuth } from '../../context/AuthContext';

const PermissionGate = ({ permission, permissions = [], children, fallback = null }) => {
  const { user } = useAuth();
  const requiredPermissions = permission ? [permission, ...permissions] : permissions;

  if (!requiredPermissions.length) {
    return children;
  }

  const userPermissions = user?.permissions || [];
  const allowed = requiredPermissions.some((item) => userPermissions.includes(item));

  return allowed ? children : fallback;
};

export default PermissionGate;
