import axios from 'axios';
import { clearAppStorage } from '../utils/sessionUtils';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const UNAUTHORIZED_EVENT = 'interniq:unauthorized';
export const FORBIDDEN_EVENT = 'interniq:forbidden';
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
export const ENABLE_MOCK_FALLBACK = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let accessToken = '';
let refreshPromise = null;

export const setAccessToken = (token = '') => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = '';
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Something went wrong.';
    const originalRequest = error.config || {};
    const authUrl = originalRequest.url || '';

    if (status === 401 && !originalRequest._retry && !authUrl.includes('/auth/login') && !authUrl.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient.post('/auth/refresh')
            .then((response) => response.data?.data?.accessToken || response.data?.data?.token || '')
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`
          };
          return api(originalRequest);
        }
      } catch {
        // Fall through to normal unauthorized handling.
      }
    }

    if (status === 401) {
      clearAccessToken();
      clearAppStorage();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: { message } }));
    }

    if (status === 403) {
      window.dispatchEvent(new CustomEvent(FORBIDDEN_EVENT, { detail: { message } }));
    }

    return Promise.reject({
      message,
      status,
      data: error.response?.data
    });
  }
);

export const unwrapApiData = (response) => response.data?.data ?? response.data;

export const unwrapApiList = (response) => {
  const data = unwrapApiData(response);
  return Array.isArray(data) ? data : data?.content || [];
};

export const withMockFallback = async (apiRequest, mockRequest) => {
  // Mock data remains available for isolated frontend testing, but the live app uses the backend by default.
  if (USE_MOCK_API) {
    return mockRequest();
  }

  try {
    return await apiRequest();
  } catch (error) {
    const canFallback = !error.status || [404, 501, 502, 503, 504].includes(error.status);

    if (ENABLE_MOCK_FALLBACK && canFallback) {
      return mockRequest(error);
    }

    throw error;
  }
};

export default api;
