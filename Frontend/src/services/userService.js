import apiClient from '../api/axiosConfig.js';

export const getUsers = () => apiClient.get('/users');

export const getUser = (id) => apiClient.get(`/users/${id}`);

export const createUser = (payload) => apiClient.post('/users', payload);

export const updateUser = (id, payload) => apiClient.put(`/users/${id}`, payload);

export const deactivateUser = (id) => apiClient.patch(`/users/${id}/deactivate`);

export const activateUser = (id) => apiClient.patch(`/users/${id}/activate`);

export const deleteUser = (id) => apiClient.delete(`/users/${id}`);

// Only ACTIVE / INACTIVE / ARCHIVED are real, backend-supported states.
export function getUserStatus(user) {
  if (user?.deleted) {
    return 'ARCHIVED';
  }
  return user?.active === false ? 'INACTIVE' : 'ACTIVE';
}

// The backend only ever persists username/email/role — there is no separate
// display name. The username itself is the account's identity.
export function getUserDisplayName(user) {
  return user?.username || 'Unnamed user';
}

// First/last name are not persisted fields; they only exist as form inputs
// used to generate a friendly username on create/edit (see buildUserPayload).
export function getUserInitialFormData(user = {}) {
  const nameParts = String(user.username || '').split(/[._\s-]+/).filter(Boolean);

  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user.email || '',
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
