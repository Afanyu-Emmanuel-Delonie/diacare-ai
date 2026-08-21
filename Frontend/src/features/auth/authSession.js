import { ROLES } from '../../utils/roles.js';

const SESSION_KEY = 'diabetesMonitoring.auth';
const allowedRoles = new Set(Object.values(ROLES));

function decodePayload(token) {
  if (typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function sessionFromToken(accessToken) {
  const payload = decodePayload(accessToken);
  const role = typeof payload?.role === 'string' ? payload.role.toUpperCase() : '';
  const expiresAt = Number(payload?.exp) * 1000;

  if (!payload?.sub || !allowedRoles.has(role) || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  return {
    accessToken,
    expiresAt,
    user: {
      username: payload.sub,
      role
    }
  };
}

export function createAuthSession(accessToken) {
  const session = sessionFromToken(accessToken);
  if (!session) {
    throw new Error('The server returned an invalid authentication token.');
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function readAuthSession() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    const validated = sessionFromToken(stored?.accessToken);

    if (!validated) {
      clearAuthSession();
      return null;
    }

    return validated;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function getAccessToken() {
  return readAuthSession()?.accessToken || null;
}

export function clearAuthSession() {
  sessionStorage.removeItem(SESSION_KEY);

  // Remove credentials written by the retired authentication implementation.
  ['jwtToken', 'refreshToken', 'userRole', 'userEmail', 'authUser', 'authSessionExpired'].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}
