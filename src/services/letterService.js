import api, { unwrapApiData } from './api';

export const letterTypes = [
  'OFFER_LETTER',
  'SELECTION_LETTER',
  'REJECTION_LETTER',
  'COMPLETION_CERTIFICATE',
  'EXPERIENCE_LETTER'
];

export const letterStatuses = ['DRAFT', 'GENERATED', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

const endpoints = {
  generate: '/letters/generate',
  all: '/letters',
  byId: (id) => `/letters/${id}`,
  status: (id) => `/letters/${id}/status`,
  send: (id) => `/letters/${id}/send`,
  download: (id) => `/letters/${id}/download`
};

export const letterService = {
  generateLetter: async (data) => {
    const response = await api.post(endpoints.generate, data);
    return unwrapApiData(response);
  },

  getLetters: async () => {
    const response = await api.get(endpoints.all);
    return unwrapApiData(response);
  },

  getLetterById: async (id) => {
    const response = await api.get(endpoints.byId(id));
    return unwrapApiData(response);
  },

  updateLetterStatus: async (id, data) => {
    const response = await api.put(endpoints.status(id), data);
    return unwrapApiData(response);
  },

  sendLetter: async (id) => {
    const response = await api.post(endpoints.send(id));
    return unwrapApiData(response);
  },

  downloadLetter: async (id) => {
    const response = await api.get(endpoints.download(id), { responseType: 'text' });
    const blob = new Blob([response.data], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    return true;
  }
};
