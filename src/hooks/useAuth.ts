import { useState, useEffect, useCallback } from 'react';
import { SECURITY_CONFIG, STORAGE_KEYS } from '@/lib/constants';
import { AuthState, Manager } from '@/lib/types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    loginAttempts: 0,
    blockedUntil: null,
    sessionStartTime: null,
    userType: null,
    managerId: null
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
    const userType = localStorage.getItem(STORAGE_KEYS.userType) as 'admin' | 'manager' | null;
    const managerId = localStorage.getItem(STORAGE_KEYS.managerId);
    
    if (loggedIn === 'true' && sessionStart) {
      const sessionTime = parseInt(sessionStart);
      const sessionAge = (Date.now() - sessionTime) / 60000;
      
      if (sessionAge < SECURITY_CONFIG.sessionTimeout) {
        const remaining = Math.floor((SECURITY_CONFIG.sessionTimeout - sessionAge) * 60);
        setTimeLeft(remaining);
        setAuthState(prev => ({
          ...prev,
          isLoggedIn: true,
          sessionStartTime: sessionTime,
          userType,
          managerId
        }));
      } else {
        localStorage.removeItem(STORAGE_KEYS.loggedIn);
        localStorage.removeItem(STORAGE_KEYS.sessionStart);
        localStorage.removeItem(STORAGE_KEYS.userType);
        localStorage.removeItem(STORAGE_KEYS.managerId);
      }
    }
  }, []);

  const loginAsAdmin = useCallback((password: string): boolean => {
    if (checkBlockStatus()) return false;
    
    if (password === SECURITY_CONFIG.password) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
      localStorage.setItem(STORAGE_KEYS.sessionStart, now.toString());
      localStorage.setItem(STORAGE_KEYS.userType, 'admin');
      localStorage.removeItem(STORAGE_KEYS.managerId);
      localStorage.removeItem(STORAGE_KEYS.loginAttempts);
      localStorage.removeItem(STORAGE_KEYS.blocked);
      
      setTimeLeft(SECURITY_CONFIG.sessionTimeout * 60);
      setAuthState({
        isLoggedIn: true,
        loginAttempts: 0,
        blockedUntil: null,
        sessionStartTime: now,
        userType: 'admin',
        managerId: null
      });
      return true;
    } else {
      handleFailedAttempt();
      return false;
    }
  }, [checkBlockStatus]);

  const loginAsManager = useCallback((manager: Manager): void => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    localStorage.setItem(STORAGE_KEYS.sessionStart, now.toString());
    localStorage.setItem(STORAGE_KEYS.userType, 'manager');
    localStorage.setItem(STORAGE_KEYS.managerId, manager.id);
    localStorage.removeItem(STORAGE_KEYS.loginAttempts);
    localStorage.removeItem(STORAGE_KEYS.blocked);
    
    setTimeLeft(SECURITY_CONFIG.sessionTimeout * 60);
    setAuthState({
      isLoggedIn: true,
      loginAttempts: 0,
      blockedUntil: null,
      sessionStartTime: now,
      userType: 'manager',
      managerId: manager.id
    });
  }, []);

  const handleFailedAttempt = useCallback(() => {
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
  }, [authState.loginAttempts]);

  const logout = useCallback((timeout = false) => {
    localStorage.removeItem(STORAGE_KEYS.loggedIn);
    localStorage.removeItem(STORAGE_KEYS.sessionStart);
    localStorage.removeItem(STORAGE_KEYS.userType);
    localStorage.removeItem(STORAGE_KEYS.managerId);
    
    if (timeout) {
      localStorage.removeItem(STORAGE_KEYS.loginAttempts);
    }
    
    setTimeLeft(SECURITY_CONFIG.sessionTimeout * 60);
    setAuthState(prev => ({
      ...prev,
      isLoggedIn: false,
      sessionStartTime: null,
      userType: null,
      managerId: null,
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
    loginAsAdmin,
    loginAsManager,
    handleFailedAttempt,
    logout,
    isBlocked: authState.blockedUntil !== null && Date.now() < authState.blockedUntil,
    isAdmin: authState.userType === 'admin',
    isManager: authState.userType === 'manager'
  };
}

