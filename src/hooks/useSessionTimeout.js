import { useEffect } from 'react';
import { getSessionRemainingMs } from '../utils/sessionUtils';

export const useSessionTimeout = ({ isAuthenticated, onTimeout }) => {
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const remainingMs = getSessionRemainingMs();

    if (remainingMs <= 0) {
      onTimeout();
      return undefined;
    }

    // Keep JWT-backed sessions aligned with the frontend's 30-minute inactivity window.
    const timeoutId = window.setTimeout(onTimeout, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, onTimeout]);
};
