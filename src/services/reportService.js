import api, { unwrapApiData } from './api';

const reportEndpoints = {
  dashboardStats: '/reports/dashboard-stats',
  intern: (internId) => `/reports/intern/${internId}`,
  attendance: '/reports/attendance',
  tasks: '/reports/tasks',
  departments: '/reports/departments'
};

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const reportService = {
  getDashboardStats: async () => {
    const response = await api.get(reportEndpoints.dashboardStats);
    return unwrapApiData(response);
  },

  getInternReport: async (internId) => {
    const response = await api.get(reportEndpoints.intern(internId));
    return unwrapApiData(response);
  },

  getAttendanceReport: async (filters = {}) => {
    const response = await api.get(`${reportEndpoints.attendance}${buildQuery(filters)}`);
    return unwrapApiData(response);
  },

  getTaskReport: async (filters = {}) => {
    const response = await api.get(`${reportEndpoints.tasks}${buildQuery(filters)}`);
    return unwrapApiData(response);
  },

  getDepartmentReport: async () => {
    const response = await api.get(reportEndpoints.departments);
    return unwrapApiData(response);
  },

  endpoints: reportEndpoints
};
