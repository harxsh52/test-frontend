import { ROLES } from './roles';

export const roleLabels = {
  [ROLES.INTERN]: 'Intern',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.HR]: 'HR',
  [ROLES.ADMIN]: 'Admin'
};

export const dashboardPaths = {
  [ROLES.INTERN]: '/intern/dashboard',
  [ROLES.MANAGER]: '/manager/dashboard',
  [ROLES.HR]: '/hr/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard'
};

export const getDashboardPath = (role) => dashboardPaths[role] || '/login';

export const canAccessRole = (userRole, allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  return allowedRoles.includes(userRole);
};
