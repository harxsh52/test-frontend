import api, { unwrapApiData } from './api';

const aiEndpoints = {
  screenResume: (candidateId) => `/ai/resume-screen/${candidateId}`,
  result: (candidateId) => `/ai/resume-screen/${candidateId}`
};

export const aiService = {
  screenResume: async (candidateId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(aiEndpoints.screenResume(candidateId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000
    });

    return unwrapApiData(response);
  },

  getResumeScreeningResult: async (candidateId) => {
    const response = await api.get(aiEndpoints.result(candidateId));
    return unwrapApiData(response);
  },

  endpoints: aiEndpoints
};
