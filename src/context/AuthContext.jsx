import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { authService } from '../services/authService';
import { UNAUTHORIZED_EVENT } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refreshUser = async () => {
      try {
        await authService.refreshToken();
        const currentUser = await authService.me();
        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        await authService.logout();
        if (mounted) {
          setUser(null);
          setSessionExpired(false);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    refreshUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setAuthLoading(false);
      setSessionExpired(true);
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    setSessionExpired(false);
    return loggedInUser;
  }, []);

  const logout = useCallback(async (options = {}) => {
    await authService.logout();
    setUser(null);
    setSessionExpired(Boolean(options.sessionExpired));
  }, []);

  const logoutAll = useCallback(async () => {
    await authService.logoutAll();
    setUser(null);
    setSessionExpired(false);
  }, []);

  const handleSessionTimeout = useCallback(() => {
    logout({ sessionExpired: true });
  }, [logout]);

  useSessionTimeout({
    isAuthenticated: Boolean(user) && !authLoading,
    onTimeout: handleSessionTimeout
  });

  const value = useMemo(
    () => ({
      authLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      logoutAll,
      sessionExpired,
      user
    }),
    [authLoading, login, logout, logoutAll, sessionExpired, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
