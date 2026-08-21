import apiClient from '../api/axiosConfig.js';

export const getUsers = () => apiClient.get('/users');

export const getUser = (id) => apiClient.get(`/users/${id}`);

export const createUser = (payload) => apiClient.post('/users', payload);

export const updateUser = (id, payload) => apiClient.put(`/users/${id}`, payload);

export const deactivateUser = (id) => apiClient.patch(`/users/${id}/deactivate`);

export const activateUser = (id) => apiClient.patch(`/users/${id}/activate`);

export const deleteUser = (id) => apiClient.delete(`/users/${id}`);

export function getUserStatus(user) {
  if (user?.deleted) {
    return 'ARCHIVED';
  }

  if (user?.locked) {
    return 'LOCKED';
  }

  return user?.active === false ? 'INACTIVE' : 'ACTIVE';
}

export function getUserDisplayName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return fullName || user?.fullName || user?.name || user?.username || 'Unnamed user';
}

export function getUserInitialFormData(user = {}) {
  const nameParts = String(user.username || '').split(/[._\s-]+/).filter(Boolean);

  return {
    firstName: user.firstName || nameParts[0] || '',
    lastName: user.lastName || nameParts.slice(1).join(' ') || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || user.phone || '',
    password: '',
    role: user.role || 'PATIENT',
    status: getUserStatus(user)
  };
}

export function buildUserPayload(formData, includePassword = false) {
  const firstName = formData.firstName.trim();
  const lastName = formData.lastName.trim();
  const email = formData.email.trim();
  const emailUsername = email.split('@')[0] || 'user';
  const generatedUsername = [firstName, lastName].filter(Boolean).join('.').toLowerCase().replace(/[^a-z0-9.]/g, '');

  const payload = {
    username: generatedUsername || emailUsername,
    email,
    role: formData.role
  };

  if (includePassword || formData.password.trim()) {
    payload.password = formData.password;
  }

  return payload;
}
