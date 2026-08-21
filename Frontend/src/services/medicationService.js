import apiClient from '../api/axiosConfig.js';

export const getMedications = () => apiClient.get('/medications');

export const getMedicationsByPatient = (patientId) => apiClient.get(`/medications/patient/${patientId}`);

export const getMedication = (id) => apiClient.get(`/medications/${id}`);

export const createMedication = (payload) => apiClient.post('/medications', payload);

export const updateMedication = (id, payload) => apiClient.put(`/medications/${id}`, payload);

export const updateMedicationAdherence = (id, payload) => apiClient.patch(`/medications/${id}/adherence`, payload);

export const deleteMedication = (id) => apiClient.delete(`/medications/${id}`);

export function getMedicationStatus(medication) {
  if (medication?.status) {
    return medication.status;
  }

  if (medication?.endDate && medication.endDate < new Date().toISOString().slice(0, 10)) {
    return 'INACTIVE';
  }

  return 'ACTIVE';
}

export function isMissedMedication(medication) {
  return medication?.missedMedicationAlert || medication?.adherenceStatus === 'MISSED';
}

export function filterMedications(medications, filters) {
  const search = filters.search.trim().toLowerCase();
  const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const to = filters.dateTo ? new Date(filters.dateTo) : null;

  return medications.filter((medication) => {
    const startDate = medication.startDate ? new Date(medication.startDate) : null;
    const matchesSearch =
      !search ||
      medication.medicationName?.toLowerCase().includes(search) ||
      medication.patientName?.toLowerCase().includes(search) ||
      medication.medicationClass?.toLowerCase().includes(search) ||
      medication.purpose?.toLowerCase().includes(search);
    const matchesPatient = filters.patient === 'ALL' || String(medication.patientId) === filters.patient || medication.patientName === filters.patient;
    const matchesName = filters.medicationName === 'ALL' || medication.medicationName === filters.medicationName;
    const matchesStatus = filters.status === 'ALL' || getMedicationStatus(medication) === filters.status || medication.adherenceStatus === filters.status;
    const matchesFrom = !from || (startDate && startDate >= from);
    const matchesTo = !to || (startDate && startDate <= to);

    return matchesSearch && matchesPatient && matchesName && matchesStatus && matchesFrom && matchesTo;
  });
}
