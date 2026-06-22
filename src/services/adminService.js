import api, { unwrapApiData } from './api';

const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

const list = async (url, params) => unwrapApiData(await api.get(`${url}${qs(params)}`));
const get = async (url) => unwrapApiData(await api.get(url));
const post = async (url, body) => unwrapApiData(await api.post(url, body));
const put = async (url, body) => unwrapApiData(await api.put(url, body));
const remove = async (url) => unwrapApiData(await api.delete(url));

export const adminService = {
  getDashboard: () => get('/admin/dashboard'),

  getUsers: (filters) => list('/admin/users', filters),
  getUser: (id) => get(`/admin/users/${id}`),
  createUser: (payload) => post('/admin/users', payload),
  updateUser: (id, payload) => put(`/admin/users/${id}`, payload),
  updateUserStatus: (id, status) => put(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id, role) => put(`/admin/users/${id}/role`, { role }),
  resetPassword: (id, password) => post(`/admin/users/${id}/reset-password`, password ? { password } : {}),
  lockUser: (id) => put(`/admin/users/${id}/lock`),
  unlockUser: (id) => put(`/admin/users/${id}/unlock`),

  getInterns: (filters) => list('/admin/interns', filters),
  getIntern: (id) => get(`/admin/interns/${id}`),
  updateIntern: (id, payload) => put(`/admin/interns/${id}`, payload),
  assignManager: (id, managerId) => put(`/admin/interns/${id}/assign-manager`, { managerId }),
  assignDepartment: (id, payload) => put(`/admin/interns/${id}/assign-department`, payload),

  getManagers: () => list('/admin/managers'),
  getManager: (id) => get(`/admin/managers/${id}`),
  createManager: (payload) => post('/admin/managers', payload),
  updateManager: (id, payload) => put(`/admin/managers/${id}`, payload),
  getManagerInterns: (id) => list(`/admin/managers/${id}/interns`),

  getHrUsers: () => list('/admin/hr-users'),
  getHrUser: (id) => get(`/admin/hr-users/${id}`),
  createHrUser: (payload) => post('/admin/hr-users', payload),
  updateHrUser: (id, payload) => put(`/admin/hr-users/${id}`, payload),

  getDepartments: () => list('/admin/departments'),
  createDepartment: (payload) => post('/admin/departments', payload),
  updateDepartment: (id, payload) => put(`/admin/departments/${id}`, payload),
  disableDepartment: (id) => remove(`/admin/departments/${id}`),

  getSubDepartments: () => list('/admin/sub-departments'),
  createSubDepartment: (payload) => post('/admin/sub-departments', payload),
  updateSubDepartment: (id, payload) => put(`/admin/sub-departments/${id}`, payload),
  disableSubDepartment: (id) => remove(`/admin/sub-departments/${id}`),

  getAssignedCompanies: () => list('/admin/assigned-companies'),
  createAssignedCompany: (payload) => post('/admin/assigned-companies', payload),
  updateAssignedCompany: (id, payload) => put(`/admin/assigned-companies/${id}`, payload),
  disableAssignedCompany: (id) => remove(`/admin/assigned-companies/${id}`),

  getAttendance: (filters) => list('/admin/attendance', filters),
  getAttendanceSummary: () => get('/admin/attendance/summary'),
  syncAttendance: () => post('/admin/attendance/sync'),

  getTasks: (filters) => list('/admin/tasks', filters),
  getTasksSummary: () => get('/admin/tasks/summary'),

  getFeedbackSummary: () => get('/admin/feedback/summary'),
  getManagerFeedback: () => list('/admin/manager-feedback'),
  getInternManagerFeedback: () => list('/admin/intern-manager-feedback'),

  getCandidates: (filters) => list('/admin/candidates', filters),
  getCandidatesSummary: () => get('/admin/candidates/summary'),

  getInterviews: () => list('/admin/interviews'),
  getInterviewResults: () => list('/admin/interview-results'),
  getInterviewsSummary: () => get('/admin/interviews/summary'),

  getReportsSummary: () => get('/admin/reports/summary'),
  getDepartmentReports: () => get('/admin/reports/departments'),
  getInternReports: () => get('/admin/reports/interns'),
  getManagerReports: () => get('/admin/reports/managers'),
  getAttendanceReports: () => get('/admin/reports/attendance'),
  getTaskReports: () => get('/admin/reports/tasks'),
  getFeedbackReports: () => get('/admin/reports/feedback'),

  getNotifications: (filters) => list('/admin/notifications', filters),
  getNotification: (id) => get(`/admin/notifications/${id}`),
  resendNotification: (id) => post(`/admin/notifications/${id}/resend`),

  getAuditLogs: (filters) => get(`/admin/audit-logs${qs(filters)}`),
  getLoginAuditLogs: () => list('/admin/login-audit-logs'),
  search: (filters) => list('/admin/search', filters),
  getSettings: () => get('/admin/settings'),
  updateSettings: (settings) => put('/admin/settings', settings)
};

export default adminService;
