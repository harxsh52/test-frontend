import { mockUsers } from '../data/mockUsers';
import api, { clearAccessToken, getAccessToken, setAccessToken, unwrapApiData, withMockFallback } from './api';
import {
  clearAppStorage,
  getStoredUser,
  saveAuthSession,
  updateStoredUser
} from '../utils/sessionUtils';

const authEndpoints = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  logoutAll: '/auth/logout-all',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password'
};

const roleDesignations = {
  INTERN: 'Intern',
  MANAGER: 'Manager',
  HR: 'HR',
  ADMIN: 'Admin'
};

const createMockToken = (user) => `mock-jwt-${user.role.toLowerCase()}-${Date.now()}`;
const removePassword = ({ password, ...user }) => user;

export const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    id: user.id ?? user.userId,
    email: user.email,
    manager: user.managerName || user.manager || '',
    status: user.active === false ? 'INACTIVE' : user.status || 'ACTIVE',
    designation: user.designation || roleDesignations[user.role] || user.role
  };
};

const mockAuthService = {
  login: ({ email, password }) => {
    const user = mockUsers.find(
      (mockUser) => mockUser.email.toLowerCase() === email.toLowerCase() && mockUser.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const safeUser = normalizeUser(removePassword(user));
    const token = createMockToken(safeUser);
    setAccessToken(token);
    saveAuthSession(safeUser, token);

    return safeUser;
  },

  register: ({ name, email, role }) =>
    normalizeUser({
      id: `u-${role.toLowerCase()}-${Date.now()}`,
      name,
      email,
      role,
      status: 'ACTIVE',
      designation: roleDesignations[role] || role
    }),

  me: () => {
    const user = getStoredUser();

    if (!user) {
      throw new Error('No active user session.');
    }

    return normalizeUser(user);
  }
};

export const authService = {
  login: ({ email, password }) =>
    withMockFallback(
      async () => {
        const response = await api.post(authEndpoints.login, { email, password });
        const payload = unwrapApiData(response);
        const user = normalizeUser(payload.user || payload);
        const token = payload.accessToken || payload.token || payload.jwt || '';

        setAccessToken(token);
        saveAuthSession(user);
        return user;
      },
      () => mockAuthService.login({ email, password })
    ),

  register: ({ name, email, password, role }) =>
    withMockFallback(
      async () => {
        const response = await api.post(authEndpoints.register, { name, email, password, role });
        return normalizeUser(unwrapApiData(response));
      },
      () => mockAuthService.register({ name, email, role })
    ),

  me: () =>
    withMockFallback(
      async () => {
        const response = await api.get(authEndpoints.me);
        const user = normalizeUser(unwrapApiData(response));

        updateStoredUser(user);
        return user;
      },
      () => mockAuthService.me()
    ),

  refreshToken: async () => {
    const response = await api.post(authEndpoints.refresh);
    const payload = unwrapApiData(response);
    const token = payload.accessToken || payload.token || '';
    setAccessToken(token);
    return token;
  },

  getCurrentUser: () => null,

  getToken: getAccessToken,

  logout: async () => {
    try {
      await api.post(authEndpoints.logout);
    } catch {
      // Local cleanup still happens even if the server session is already gone.
    }
    clearAccessToken();
    clearAppStorage();
  },

  logoutAll: async () => {
    try {
      await api.post(authEndpoints.logoutAll);
    } finally {
      clearAccessToken();
      clearAppStorage();
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post(authEndpoints.forgotPassword, { email });
    return unwrapApiData(response);
  },

  resetPassword: async ({ token, newPassword }) => {
    const response = await api.post(authEndpoints.resetPassword, { token, newPassword });
    clearAccessToken();
    clearAppStorage();
    return unwrapApiData(response);
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.post(authEndpoints.changePassword, { currentPassword, newPassword });
    clearAccessToken();
    clearAppStorage();
    return unwrapApiData(response);
  },

  endpoints: authEndpoints,

  getCurrentUserFromApi: () => authService.me()
};
