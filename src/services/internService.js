import api, { unwrapApiData } from './api';

const internEndpoints = {
  dashboard: '/intern/dashboard',
  profile: '/intern/profile',
  attendanceToday: '/intern/attendance/today',
  attendanceHistory: '/intern/attendance/history',
  attendanceSummary: '/intern/attendance/summary',
  tasks: '/intern/tasks',
  taskById: (taskId) => `/intern/tasks/${taskId}`,
  taskStart: (taskId) => `/intern/tasks/${taskId}/start`,
  taskSubmit: (taskId) => `/intern/tasks/${taskId}/submit`,
  feedback: '/intern/feedback',
  managerFeedback: '/intern/manager-feedback',
  report: '/intern/report',
  interviews: '/intern/interviews',
  interviewResults: '/intern/interview-results',
  notifications: '/intern/notifications'
};

const query = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  const value = searchParams.toString();
  return value ? `?${value}` : '';
};

const normalizeTask = (task) => ({
  ...task,
  status: task.displayStatus || task.status,
  assignedBy: task.assignedByName,
  assignedById: task.assignedByManagerId,
  submissionNote: task.submissionNote || task.submissionText || '',
  submissionLink: task.githubLink || task.deploymentLink || task.attachmentUrl || task.submissionLink || ''
});

const normalizeTasks = (tasks = []) => tasks.map(normalizeTask);

export const internService = {
  getInternDashboard: async () => {
    const response = await api.get(internEndpoints.dashboard);
    const dashboard = unwrapApiData(response);
    return {
      ...dashboard,
      latestTasks: normalizeTasks(dashboard.latestTasks || [])
    };
  },

  getInternProfile: async () => {
    const response = await api.get(internEndpoints.profile);
    return unwrapApiData(response);
  },

  updateInternProfile: async (payload) => {
    const response = await api.put(internEndpoints.profile, payload);
    return unwrapApiData(response);
  },

  getTodayAttendance: async () => {
    const response = await api.get(internEndpoints.attendanceToday);
    return unwrapApiData(response);
  },

  getAttendanceHistory: async (params = {}) => {
    const response = await api.get(`${internEndpoints.attendanceHistory}${query(params)}`);
    return unwrapApiData(response);
  },

  getAttendanceSummary: async () => {
    const response = await api.get(internEndpoints.attendanceSummary);
    return unwrapApiData(response);
  },

  getInternTasks: async (params = {}) => {
    const response = await api.get(`${internEndpoints.tasks}${query(params)}`);
    return normalizeTasks(unwrapApiData(response));
  },

  getInternTaskById: async (taskId) => {
    const response = await api.get(internEndpoints.taskById(taskId));
    return normalizeTask(unwrapApiData(response));
  },

  startTask: async (taskId) => {
    const response = await api.put(internEndpoints.taskStart(taskId));
    return normalizeTask(unwrapApiData(response));
  },

  submitTask: async (taskId, payload) => {
    const response = await api.post(internEndpoints.taskSubmit(taskId), payload);
    return normalizeTask(unwrapApiData(response));
  },

  getInternFeedback: async () => {
    const response = await api.get(internEndpoints.feedback);
    return unwrapApiData(response);
  },

  submitManagerFeedback: async (payload) => {
    const response = await api.post(internEndpoints.managerFeedback, payload);
    return unwrapApiData(response);
  },

  getInternReport: async () => {
    const response = await api.get(internEndpoints.report);
    return unwrapApiData(response);
  },

  getInternInterviews: async () => {
    const response = await api.get(internEndpoints.interviews);
    return unwrapApiData(response);
  },

  getInternInterviewResults: async () => {
    const response = await api.get(internEndpoints.interviewResults);
    return unwrapApiData(response);
  },

  getInternNotifications: async () => {
    const response = await api.get(internEndpoints.notifications);
    return unwrapApiData(response);
  },

  endpoints: internEndpoints
};
