import axios from 'axios';
import { clearAuthSession, getAccessToken } from '../features/auth/authSession.js';
import { renewAuthSession } from '../features/auth/sessionRenewal.js';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestHadToken = Boolean(originalRequest?.headers?.Authorization);

    if (error.response?.status === 401 && requestHadToken && !originalRequest._renewalAttempted) {
      originalRequest._renewalAttempted = true;

      try {
        const session = await renewAuthSession();
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        window.dispatchEvent(new window.CustomEvent('auth:renewed', { detail: session }));
        return apiClient(originalRequest);
      } catch {
        clearAuthSession();
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    if (error.response?.status === 403 && window.location.pathname !== '/403') {
      window.location.assign('/403');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
