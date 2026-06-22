import api, { unwrapApiData, unwrapApiList } from './api';

const candidateEndpoints = {
  list: '/candidates',
  create: '/candidates',
  byId: (candidateId) => `/candidates/${candidateId}`
};

export const normalizeCandidate = (candidate) => ({
  ...candidate,
  role: candidate.role || candidate.appliedRole,
  stage: candidate.stage || candidate.status || 'NEW',
  status: candidate.status || candidate.stage || 'NEW',
  aiScore: candidate.aiScore ?? null,
  aiRecommendation: candidate.aiRecommendation || ''
});

export const candidateService = {
  getCandidates: async () => {
    const response = await api.get(candidateEndpoints.list);
    return unwrapApiList(response).map(normalizeCandidate);
  },

  getCandidate: async (candidateId) => {
    const response = await api.get(candidateEndpoints.byId(candidateId));
    return normalizeCandidate(unwrapApiData(response));
  },

  createCandidate: async (candidate) => {
    const response = await api.post(candidateEndpoints.create, candidate);
    return normalizeCandidate(unwrapApiData(response));
  },

  endpoints: candidateEndpoints
};
