import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authenticate, endSession } from './authApi.js';
import { clearAuthSession, createAuthSession, readAuthSession } from './authSession.js';
import { renewAuthSession } from './sessionRenewal.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readAuthSession);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const signIn = useCallback(async (credentials) => {
    const accessToken = await authenticate(credentials);
    const authenticatedSession = createAuthSession(accessToken);
    setSession(authenticatedSession);
    setSessionExpired(false);
    return authenticatedSession;
  }, []);

  const signOut = useCallback(({ expired = false } = {}) => {
    clearAuthSession();
    setSession(null);
    setSessionExpired(expired);
    if (!expired) {
      endSession().catch(() => {});
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (!session) {
        try {
          const restoredSession = await renewAuthSession();
          if (active) {
            setSession(restoredSession);
          }
        } catch {
          clearAuthSession();
        }
      }
      if (active) {
        setIsInitializing(false);
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.expiresAt) {
      return undefined;
    }

    const renewAt = Math.max(0, session.expiresAt - Date.now() - 60_000);
    const timer = window.setTimeout(async () => {
      try {
        setSession(await renewAuthSession());
      } catch {
        signOut({ expired: true });
      }
    }, renewAt);
    return () => window.clearTimeout(timer);
  }, [session?.expiresAt, signOut]);

  useEffect(() => {
    const handleUnauthorized = () => signOut({ expired: true });
    const handleRenewed = (event) => setSession(event.detail);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:renewed', handleRenewed);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:renewed', handleRenewed);
    };
  }, [signOut]);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(session),
    isInitializing,
    sessionExpired,
    token: session?.accessToken || null,
    user: session?.user || null,
    userRole: session?.user?.role || null,
    signIn,
    signOut
  }), [session, sessionExpired, isInitializing, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
