import api, { unwrapApiData } from './api';

const endpoints = {
  dashboard: '/manager/dashboard',
  interns: '/manager/interns',
  intern: (internId) => `/manager/interns/${internId}`,
  internAttendance: (internId) => `/manager/interns/${internId}/attendance`,
  internAttendanceSummary: (internId) => `/manager/interns/${internId}/attendance/summary`,
  tasks: '/manager/tasks',
  task: (taskId) => `/manager/tasks/${taskId}`,
  submittedTasks: '/manager/tasks/submitted',
  reviewedTasks: '/manager/tasks/reviewed',
  reviewTask: (taskId) => `/manager/tasks/${taskId}/review`,
  internFeedback: (internId) => `/manager/interns/${internId}/feedback`,
  reportsSummary: '/manager/reports/summary',
  internReport: (internId) => `/manager/interns/${internId}/report`,
  interviewResults: '/manager/interview-results',
  internInterviewResults: (internId) => `/manager/interns/${internId}/interview-results`
};

const query = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') searchParams.set(key, value);
  });
  const value = searchParams.toString();
  return value ? `?${value}` : '';
};

const normalizeTask = (task) => ({
  ...task,
  internId: task.assignedToInternId,
  internName: task.assignedToName,
  empId: task.assignedToEmpId,
  assignedBy: task.assignedByName,
  submissionNote: task.submissionNote || task.submissionText || '',
  submissionLink: task.submissionLink || task.githubLink || task.deploymentLink || task.attachmentSubmissionUrl || ''
});

const normalizeTasks = (tasks = []) => tasks.map(normalizeTask);

export const managerService = {
  getManagerDashboard: async () => {
    const response = await api.get(endpoints.dashboard);
    const data = unwrapApiData(response);
    return {
      ...data,
      pendingReviews: normalizeTasks(data.pendingReviews || []),
      recentSubmissions: normalizeTasks(data.recentSubmissions || [])
    };
  },

  getAssignedInterns: async (params = {}) => {
    const response = await api.get(`${endpoints.interns}${query(params)}`);
    return unwrapApiData(response);
  },

  getAssignedInternById: async (internId) => {
    const response = await api.get(endpoints.intern(internId));
    return unwrapApiData(response);
  },

  getInternAttendance: async (internId, params = {}) => {
    const response = await api.get(`${endpoints.internAttendance(internId)}${query(params)}`);
    return unwrapApiData(response);
  },

  getInternAttendanceSummary: async (internId) => {
    const response = await api.get(endpoints.internAttendanceSummary(internId));
    return unwrapApiData(response);
  },

  getManagerTasks: async (params = {}) => {
    const response = await api.get(`${endpoints.tasks}${query(params)}`);
    return normalizeTasks(unwrapApiData(response));
  },

  createTask: async (payload) => {
    const response = await api.post(endpoints.tasks, {
      ...payload,
      assignedToInternId: Number(payload.assignedToInternId || payload.internId)
    });
    return normalizeTask(unwrapApiData(response));
  },

  updateTask: async (taskId, payload) => {
    const response = await api.put(endpoints.task(taskId), {
      ...payload,
      assignedToInternId: Number(payload.assignedToInternId || payload.internId)
    });
    return normalizeTask(unwrapApiData(response));
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(endpoints.task(taskId));
    return unwrapApiData(response);
  },

  getSubmittedTasks: async () => {
    const response = await api.get(endpoints.submittedTasks);
    return normalizeTasks(unwrapApiData(response));
  },

  getReviewedTasks: async () => {
    const response = await api.get(endpoints.reviewedTasks);
    return normalizeTasks(unwrapApiData(response));
  },

  reviewTask: async (taskId, payload) => {
    const response = await api.put(endpoints.reviewTask(taskId), {
      reviewStatus: payload.reviewStatus || payload.decision,
      rating: payload.rating,
      feedback: payload.feedback,
      strengths: payload.strengths,
      improvementAreas: payload.improvementAreas
    });
    return normalizeTask(unwrapApiData(response));
  },

  getInternFeedback: async (internId) => {
    const response = await api.get(endpoints.internFeedback(internId));
    return unwrapApiData(response);
  },

  createInternFeedback: async (internId, payload) => {
    const response = await api.post(endpoints.internFeedback(internId), payload);
    return unwrapApiData(response);
  },

  getManagerReports: async () => {
    const response = await api.get(endpoints.reportsSummary);
    return unwrapApiData(response);
  },

  getInternReport: async (internId) => {
    const response = await api.get(endpoints.internReport(internId));
    return unwrapApiData(response);
  },

  getManagerInterviewResults: async () => {
    const response = await api.get(endpoints.interviewResults);
    return unwrapApiData(response);
  },

  getInternInterviewResults: async (internId) => {
    const response = await api.get(endpoints.internInterviewResults(internId));
    return unwrapApiData(response);
  },

  endpoints
};
