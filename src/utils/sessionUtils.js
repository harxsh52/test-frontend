export const SESSION_DURATION_MS = 30 * 60 * 1000;

export const STORAGE_KEYS = {
  user: 'interniq_user',
  token: 'interniq_token',
  loginTime: 'interniq_login_time',
  attendance: 'interniq_attendance_records',
  tasks: 'interniq_tasks',
  users: 'interniq_users',
  departments: 'interniq_departments'
};

export const saveAuthSession = (user, token = '') => {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  if (token) {
    localStorage.setItem(STORAGE_KEYS.token, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.token);
  }
  localStorage.setItem(STORAGE_KEYS.loginTime, String(Date.now()));
};

export const updateStoredUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
};

export const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.token);

export const getStoredUser = () => {
  const userJson = localStorage.getItem(STORAGE_KEYS.user);

  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export const getStoredLoginTime = () => {
  const loginTime = localStorage.getItem(STORAGE_KEYS.loginTime);
  return loginTime ? Number(loginTime) : null;
};

export const isSessionExpired = (loginTime) => {
  if (!loginTime) return true;
  return Date.now() - Number(loginTime) >= SESSION_DURATION_MS;
};

export const getSessionRemainingMs = () => {
  const loginTime = getStoredLoginTime();

  if (!loginTime) return 0;

  return Math.max(SESSION_DURATION_MS - (Date.now() - loginTime), 0);
};

export const clearAppStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.loginTime);
};
