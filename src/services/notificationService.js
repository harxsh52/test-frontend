import api, { unwrapApiData } from './api';

const notificationEndpoints = {
  my: '/notifications/my',
  unreadCount: '/notifications/unread-count',
  markRead: (notificationId) => `/notifications/${notificationId}/read`,
  markAllRead: '/notifications/read-all',
  archive: (notificationId) => `/notifications/${notificationId}/archive`,
  system: '/notifications/system',
  adminAll: '/notifications/admin/all',
  emailSettings: '/notifications/email-settings',
  testEmail: '/notifications/test-email',
  hrNotifications: '/hr/notifications',
  adminNotifications: '/admin/notifications',
  sendOfferLetter: (candidateId) => `/hr/notifications/send-offer-letter/${candidateId}`,
  sendInterviewEmail: (interviewId) => `/hr/notifications/send-interview-email/${interviewId}`,
  sendSelectedEmail: (candidateId) => `/hr/notifications/send-selected-email/${candidateId}`,
  sendRejectionEmail: (candidateId) => `/hr/notifications/send-rejection-email/${candidateId}`,
  sendShortlistedEmail: (candidateId) => `/hr/notifications/send-shortlisted-email/${candidateId}`,
  sendDepartmentAssignment: (internId) => `/hr/notifications/send-department-assignment/${internId}`,
  sendManagerAssignment: (internId) => `/hr/notifications/send-manager-assignment/${internId}`,
  sendOnboarding: (internId) => `/hr/notifications/send-onboarding/${internId}`,
  byId: (notificationId) => `/hr/notifications/${notificationId}`,
  resend: (notificationId) => `/hr/notifications/${notificationId}/resend`,
  adminById: (notificationId) => `/admin/notifications/${notificationId}`,
  adminResend: (notificationId) => `/admin/notifications/${notificationId}/resend`
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

export const notificationService = {
  getMyNotifications: async () => {
    const response = await api.get(notificationEndpoints.my);
    return unwrapApiData(response);
  },

  getUnreadCount: async () => {
    const response = await api.get(notificationEndpoints.unreadCount);
    const data = unwrapApiData(response);
    return typeof data === 'number' ? data : data?.count || 0;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(notificationEndpoints.markRead(notificationId));
    return unwrapApiData(response);
  },

  markAllAsRead: async () => {
    const response = await api.put(notificationEndpoints.markAllRead);
    return unwrapApiData(response);
  },

  archiveNotification: async (notificationId) => {
    const response = await api.put(notificationEndpoints.archive(notificationId));
    return unwrapApiData(response);
  },

  createSystemNotification: async (data) => {
    const response = await api.post(notificationEndpoints.system, data);
    return unwrapApiData(response);
  },

  getAllNotificationsAdmin: async () => {
    const response = await api.get(notificationEndpoints.adminAll);
    return unwrapApiData(response);
  },

  getEmailSettings: async () => {
    const response = await api.get(notificationEndpoints.emailSettings);
    return unwrapApiData(response);
  },

  sendTestEmail: async (recipient) => {
    const response = await api.post(notificationEndpoints.testEmail, { recipient });
    return unwrapApiData(response);
  },

  getHrNotifications: async (filters = {}) => {
    const response = await api.get(`${notificationEndpoints.hrNotifications}${query(filters)}`);
    return unwrapApiData(response);
  },

  getAdminNotifications: async (filters = {}) => {
    const response = await api.get(`${notificationEndpoints.adminNotifications}${query(filters)}`);
    return unwrapApiData(response);
  },

  getNotification: async (notificationId, admin = false) => {
    const response = await api.get(admin ? notificationEndpoints.adminById(notificationId) : notificationEndpoints.byId(notificationId));
    return unwrapApiData(response);
  },

  resendNotification: async (notificationId, admin = false) => {
    const response = await api.post(admin ? notificationEndpoints.adminResend(notificationId) : notificationEndpoints.resend(notificationId));
    return unwrapApiData(response);
  },

  sendOfferLetter: async (candidateId) => {
    const response = await api.post(notificationEndpoints.sendOfferLetter(candidateId));
    return unwrapApiData(response);
  },

  sendInterviewEmail: async (interviewId) => {
    const response = await api.post(notificationEndpoints.sendInterviewEmail(interviewId));
    return unwrapApiData(response);
  },

  sendSelectedEmail: async (candidateId) => {
    const response = await api.post(notificationEndpoints.sendSelectedEmail(candidateId));
    return unwrapApiData(response);
  },

  sendRejectionEmail: async (candidateId) => {
    const response = await api.post(notificationEndpoints.sendRejectionEmail(candidateId));
    return unwrapApiData(response);
  },

  sendShortlistedEmail: async (candidateId) => {
    const response = await api.post(notificationEndpoints.sendShortlistedEmail(candidateId));
    return unwrapApiData(response);
  },

  sendDepartmentAssignment: async (internId) => {
    const response = await api.post(notificationEndpoints.sendDepartmentAssignment(internId));
    return unwrapApiData(response);
  },

  sendManagerAssignment: async (internId) => {
    const response = await api.post(notificationEndpoints.sendManagerAssignment(internId));
    return unwrapApiData(response);
  },

  sendOnboarding: async (internId) => {
    const response = await api.post(notificationEndpoints.sendOnboarding(internId));
    return unwrapApiData(response);
  },

  endpoints: notificationEndpoints
};
