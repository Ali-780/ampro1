import { useState, useEffect, useCallback } from 'react';
import { SECURITY_CONFIG } from '@/lib/constants';
import { AuthState } from '@/lib/types';

const STORAGE_KEYS = {
  loggedIn: 'logged_in',
  sessionStart: 'session_start',
  loginAttempts: 'login_attempts',
  blocked: 'system_blocked'
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    loginAttempts: 0,
    blockedUntil: null,
    sessionStartTime: null
  });
  const [timeLeft, setTimeLeft] = useState(SECURITY_CONFIG.sessionTimeout * 60);

  // Check initial state
  useEffect(() => {
    checkBlockStatus();
    checkLoginStatus();
  }, []);

  // Session timer
  useEffect(() => {
    if (!authState.isLoggedIn) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          logout(true);
          return SECURITY_CONFIG.sessionTimeout * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authState.isLoggedIn]);

  const checkBlockStatus = useCallback(() => {
    const blocked = localStorage.getItem(STORAGE_KEYS.blocked);
    if (blocked) {
      const blockData = JSON.parse(blocked);
      const now = Date.now();
      
      if (now < blockData.until) {
        setAuthState(prev => ({
          ...prev,
          blockedUntil: blockData.until
        }));
        return true;
      } else {
        localStorage.removeItem(STORAGE_KEYS.blocked);
        localStorage.removeItem(STORAGE_KEYS.loginAttempts);
      }
    }
    
    const attempts = localStorage.getItem(STORAGE_KEYS.loginAttempts);
    if (attempts) {
      setAuthState(prev => ({
        ...prev,
        loginAttempts: parseInt(attempts)
      }));
    }
    
    return false;
  }, []);

  const checkLoginStatus = useCallback(() => {
    const loggedIn = localStorage.getItem(STORAGE_KEYS.loggedIn);
    const sessionStart = localStorage.getItem(STORAGE_KEYS.sessionStart);
    
    if (loggedIn === 'true' && sessionStart) {
      const sessionTime = parseInt(sessionStart);
      const sessionAge = (Date.now() - sessionTime) / 60000;
      
      if (sessionAge < SECURITY_CONFIG.sessionTimeout) {
        const remaining = Math.floor((SECURITY_CONFIG.sessionTimeout - sessionAge) * 60);
        setTimeLeft(remaining);
        setAuthState(prev => ({
          ...prev,
          isLoggedIn: true,
          sessionStartTime: sessionTime
        }));
      } else {
        localStorage.removeItem(STORAGE_KEYS.loggedIn);
        localStorage.removeItem(STORAGE_KEYS.sessionStart);
      }
    }
  }, []);

  const login = useCallback((password: string): boolean => {
    if (checkBlockStatus()) return false;
    
    if (password === SECURITY_CONFIG.password) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
      localStorage.setItem(STORAGE_KEYS.sessionStart, now.toString());
      localStorage.removeItem(STORAGE_KEYS.loginAttempts);
      localStorage.removeItem(STORAGE_KEYS.blocked);
      
      setTimeLeft(SECURITY_CONFIG.sessionTimeout * 60);
      setAuthState({
        isLoggedIn: true,
        loginAttempts: 0,
        blockedUntil: null,
        sessionStartTime: now
      });
      return true;
    } else {
      const newAttempts = authState.loginAttempts + 1;
      localStorage.setItem(STORAGE_KEYS.loginAttempts, newAttempts.toString());
      
      if (newAttempts >= SECURITY_CONFIG.maxAttempts) {
        const blockUntil = Date.now() + SECURITY_CONFIG.blockTime * 60000;
        localStorage.setItem(STORAGE_KEYS.blocked, JSON.stringify({ until: blockUntil }));
        setAuthState(prev => ({
          ...prev,
          loginAttempts: newAttempts,
          blockedUntil: blockUntil
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          loginAttempts: newAttempts
        }));
      }
      return false;
    }
  }, [authState.loginAttempts, checkBlockStatus]);

  const logout = useCallback((timeout = false) => {
    localStorage.removeItem(STORAGE_KEYS.loggedIn);
    localStorage.removeItem(STORAGE_KEYS.sessionStart);
    
    if (timeout) {
      localStorage.removeItem(STORAGE_KEYS.loginAttempts);
    }
    
    setTimeLeft(SECURITY_CONFIG.sessionTimeout * 60);
    setAuthState(prev => ({
      ...prev,
      isLoggedIn: false,
      sessionStartTime: null,
      loginAttempts: timeout ? 0 : prev.loginAttempts
    }));
  }, []);

  const attemptsLeft = SECURITY_CONFIG.maxAttempts - authState.loginAttempts;
  const blockMinutesLeft = authState.blockedUntil 
    ? Math.ceil((authState.blockedUntil - Date.now()) / 60000)
    : 0;

  return {
    ...authState,
    timeLeft,
    attemptsLeft,
    blockMinutesLeft,
    login,
    logout,
    isBlocked: authState.blockedUntil !== null && Date.now() < authState.blockedUntil
  };
}
