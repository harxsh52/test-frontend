import api, { unwrapApiData, withMockFallback } from './api';

export const leaveTypes = [
  'SICK_LEAVE',
  'CASUAL_LEAVE',
  'EMERGENCY_LEAVE',
  'EXAM_LEAVE',
  'HALF_DAY',
  'WORK_FROM_HOME',
  'OTHER'
];

export const leaveStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const endpoints = {
  create: '/leaves',
  my: '/leaves/my',
  manager: '/leaves/manager',
  all: '/leaves/all',
  byId: (id) => `/leaves/${id}`,
  status: (id) => `/leaves/${id}/status`,
  cancel: (id) => `/leaves/${id}/cancel`,
  myBalance: '/leaves/balance/my',
  internBalance: (internId) => `/leaves/balance/${internId}`
};

const normalizeLeave = (leave) => ({
  ...leave,
  totalDays: Number(leave?.totalDays ?? 0)
});

const normalizeLeaves = (leaves = []) => leaves.map(normalizeLeave);

const mockLeaves = [];
const mockBalance = {
  totalLeaves: 12,
  usedLeaves: 0,
  pendingLeaves: 0,
  remainingLeaves: 12
};

export const leaveService = {
  createLeaveRequest: (data) =>
    withMockFallback(
      async () => {
        const response = await api.post(endpoints.create, data);
        return normalizeLeave(unwrapApiData(response));
      },
      () => normalizeLeave({ id: Date.now(), ...data, status: 'PENDING', totalDays: data.leaveType === 'HALF_DAY' ? 0.5 : 1 })
    ),

  getMyLeaves: () =>
    withMockFallback(
      async () => {
        const response = await api.get(endpoints.my);
        return normalizeLeaves(unwrapApiData(response));
      },
      () => mockLeaves
    ),

  getManagerLeaves: () =>
    withMockFallback(
      async () => {
        const response = await api.get(endpoints.manager);
        return normalizeLeaves(unwrapApiData(response));
      },
      () => mockLeaves
    ),

  getAllLeaves: () =>
    withMockFallback(
      async () => {
        const response = await api.get(endpoints.all);
        return normalizeLeaves(unwrapApiData(response));
      },
      () => mockLeaves
    ),

  getLeaveById: (id) =>
    withMockFallback(
      async () => {
        const response = await api.get(endpoints.byId(id));
        return normalizeLeave(unwrapApiData(response));
      },
      () => mockLeaves.find((leave) => String(leave.id) === String(id)) || null
    ),

  updateLeaveStatus: (id, data) =>
    withMockFallback(
      async () => {
        const response = await api.put(endpoints.status(id), data);
        return normalizeLeave(unwrapApiData(response));
      },
      () => normalizeLeave({ id, ...data })
    ),

  cancelLeave: (id) =>
    withMockFallback(
      async () => {
        const response = await api.put(endpoints.cancel(id));
        return normalizeLeave(unwrapApiData(response));
      },
      () => normalizeLeave({ id, status: 'CANCELLED' })
    ),

  getMyLeaveBalance: () =>
    withMockFallback(
      async () => {
        const response = await api.get(endpoints.myBalance);
        return unwrapApiData(response);
      },
      () => mockBalance
    ),

  getInternLeaveBalance: (internId) =>
    withMockFallback(
      async () => {
        const response = await api.get(endpoints.internBalance(internId));
        return unwrapApiData(response);
      },
      () => mockBalance
    )
};
