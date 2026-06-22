import { ROLES } from '../utils/roles';

export const navigationConfig = {
  [ROLES.INTERN]: [
    { label: 'Dashboard', path: '/intern/dashboard', icon: 'Dashboard', roles: [ROLES.INTERN] },
    { label: 'My Attendance', path: '/intern/attendance', icon: 'EventAvailable', roles: [ROLES.INTERN], permission: 'INTERN_ATTENDANCE_VIEW_SELF' },
    { label: 'My Tasks', path: '/intern/tasks', icon: 'Assignment', roles: [ROLES.INTERN], permission: 'INTERN_TASK_VIEW_SELF' },
    { label: 'My Leaves', path: '/intern/leaves', icon: 'EventBusy', roles: [ROLES.INTERN], permission: 'INTERN_LEAVE_VIEW_SELF' },
    { label: 'Apply Leave', path: '/intern/apply-leave', icon: 'AddCircle', roles: [ROLES.INTERN], permission: 'INTERN_LEAVE_CREATE' },
    { label: 'My Feedback', path: '/intern/feedback', icon: 'Feedback', roles: [ROLES.INTERN] },
    { label: 'My Report', path: '/intern/report', icon: 'Assessment', roles: [ROLES.INTERN] },
    { label: 'AI Interview', path: '/intern/ai-interview', icon: 'SmartToy', roles: [ROLES.INTERN] },
    { label: 'Notifications', path: '/notifications', icon: 'Notifications', roles: [ROLES.INTERN] },
    { label: 'My Profile', path: '/intern/profile', icon: 'Badge', roles: [ROLES.INTERN] }
  ],
  [ROLES.MANAGER]: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: 'Dashboard', roles: [ROLES.MANAGER] },
    { label: 'My Interns', path: '/manager/interns', icon: 'Group', roles: [ROLES.MANAGER] },
    { label: 'Assign Task', path: '/manager/assign-task', icon: 'AssignmentTurnedIn', roles: [ROLES.MANAGER], permission: 'MANAGER_TASK_CREATE' },
    { label: 'Review Tasks', path: '/manager/review-tasks', icon: 'Reviews', roles: [ROLES.MANAGER] },
    { label: 'Leave Requests', path: '/manager/leaves', icon: 'EventBusy', roles: [ROLES.MANAGER], permission: 'MANAGER_LEAVE_REVIEW' },
    { label: 'Interview Results', path: '/manager/interview-results', icon: 'SmartToy', roles: [ROLES.MANAGER] },
    { label: 'Reports', path: '/manager/reports', icon: 'Assessment', roles: [ROLES.MANAGER] },
    { label: 'Notifications', path: '/notifications', icon: 'Notifications', roles: [ROLES.MANAGER] },
    { label: 'Profile', path: '/manager/profile', icon: 'Badge', roles: [ROLES.MANAGER] }
  ],
  [ROLES.HR]: [
    { label: 'Dashboard', path: '/hr/dashboard', icon: 'Dashboard', roles: [ROLES.HR] },
    { label: 'Candidates', path: '/hr/candidates', icon: 'Work', roles: [ROLES.HR] },
    { label: 'Add Intern', path: '/hr/add-intern', icon: 'PersonAdd', roles: [ROLES.HR] },
    { label: 'Resume Screening', path: '/hr/resume-screening', icon: 'FactCheck', roles: [ROLES.HR], permission: 'HR_RESUME_SCREEN' },
    { label: 'AI Interview Builder', path: '/hr/interview-builder', icon: 'Psychology', roles: [ROLES.HR] },
    { label: 'Interviews', path: '/hr/interviews', icon: 'SmartToy', roles: [ROLES.HR] },
    { label: 'Letters', path: '/hr/letters', icon: 'Description', roles: [ROLES.HR] },
    { label: 'Generate Letter', path: '/hr/generate-letter', icon: 'AddCircle', roles: [ROLES.HR] },
    { label: 'Leave Management', path: '/hr/leaves', icon: 'EventBusy', roles: [ROLES.HR] },
    { label: 'Reports', path: '/hr/reports', icon: 'Assessment', roles: [ROLES.HR] },
    { label: 'Notifications', path: '/notifications', icon: 'Notifications', roles: [ROLES.HR] },
    { label: 'Profile', path: '/hr/profile', icon: 'Badge', roles: [ROLES.HR] }
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'Dashboard', roles: [ROLES.ADMIN] },
    { label: 'Users', path: '/admin/users', icon: 'ManageAccounts', roles: [ROLES.ADMIN], permission: 'ADMIN_USER_MANAGE' },
    { label: 'Departments', path: '/admin/departments', icon: 'Business', roles: [ROLES.ADMIN] },
    { label: 'Roles', path: '/admin/roles', icon: 'AdminPanelSettings', roles: [ROLES.ADMIN] },
    { label: 'All Letters', path: '/admin/letters', icon: 'Description', roles: [ROLES.ADMIN] },
    { label: 'All Leaves', path: '/admin/leaves', icon: 'EventBusy', roles: [ROLES.ADMIN] },
    { label: 'All Interviews', path: '/admin/interviews', icon: 'SmartToy', roles: [ROLES.ADMIN] },
    { label: 'All Reports', path: '/admin/reports', icon: 'Assessment', roles: [ROLES.ADMIN] },
    { label: 'System Notifications', path: '/admin/system-notifications', icon: 'NotificationsActive', roles: [ROLES.ADMIN] },
    { label: 'Settings', path: '/admin/settings', icon: 'Settings', roles: [ROLES.ADMIN] },
    { label: 'Notifications', path: '/notifications', icon: 'Notifications', roles: [ROLES.ADMIN] },
    { label: 'Profile', path: '/admin/profile', icon: 'Badge', roles: [ROLES.ADMIN] }
  ]
};

export const getNavigationForRole = (role, permissions = []) => {
  if (!permissions?.length) {
    return navigationConfig[role] || [];
  }

  const permissionSet = new Set(permissions || []);
  return (navigationConfig[role] || []).filter((item) => !item.permission || permissionSet.has(item.permission) || role === ROLES.ADMIN);
};
