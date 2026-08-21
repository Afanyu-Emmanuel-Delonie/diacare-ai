import apiClient from '../api/axiosConfig.js';

export const getPatients = () => apiClient.get('/patients');

export const getPatient = (id) => apiClient.get(`/patients/${id}`);

export const getCurrentPatient = () => apiClient.get('/patients/me');

export const createPatient = (payload) => apiClient.post('/patients', payload);

export const updatePatient = (id, payload) => apiClient.put(`/patients/${id}`, payload);

export const deactivatePatient = (id) => apiClient.patch(`/patients/${id}/deactivate`);

export const deletePatient = (id) => apiClient.delete(`/patients/${id}`);

export function getPatientStatus(patient) {
  if (patient?.deleted) {
    return 'ARCHIVED';
  }

  return patient?.active === false ? 'INACTIVE' : patient?.status || 'ACTIVE';
}

export function getPatientDisplayName(patient) {
  const fullName = [patient?.firstName, patient?.lastName].filter(Boolean).join(' ').trim();
  return fullName || patient?.fullName || patient?.name || 'Unnamed patient';
}

export function splitPatientName(patient = {}) {
  const parts = String(patient.fullName || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: patient.firstName || parts[0] || '',
    lastName: patient.lastName || parts.slice(1).join(' ') || ''
  };
}

export function getPatientInitialFormData(patient = {}) {
  const name = splitPatientName(patient);

  return {
    firstName: name.firstName,
    lastName: name.lastName,
    email: patient.email || '',
    phone: patient.phone || patient.phoneNumber || '',
    gender: patient.gender || '',
    dateOfBirth: patient.dateOfBirth || '',
    diabetesType: patient.diabetesType || 'TYPE_2',
    diagnosisDate: patient.diagnosisDate || '',
    address: patient.address || '',
    emergencyContactName: patient.emergencyContactName || '',
    emergencyContactPhone: patient.emergencyContactPhone || '',
    doctorId: patient.doctorId || '',
    nurseId: patient.nurseId || '',
    caregiverId: patient.caregiverId || '',
    status: getPatientStatus(patient)
  };
}

export function buildPatientPayload(formData) {
  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim();

  return {
    fullName,
    email: formData.email.trim(),
    phone: formData.phone?.trim() || null,
    dateOfBirth: formData.dateOfBirth,
    diabetesType: formData.diabetesType || null,
    emergencyContactName: formData.emergencyContactName?.trim() || null,
    emergencyContactPhone: formData.emergencyContactPhone?.trim() || null,
    status: formData.status || 'ACTIVE',
    doctorId: formData.doctorId ? Number(formData.doctorId) : null,
    nurseId: formData.nurseId ? Number(formData.nurseId) : null,
    caregiverId: formData.caregiverId ? Number(formData.caregiverId) : null
  };
}
