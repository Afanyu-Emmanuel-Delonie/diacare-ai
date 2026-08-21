import apiClient from '../api/axiosConfig.js';

export const getMedicalRecords = () => apiClient.get('/medical-records');

export const getMedicalRecordsByPatient = (patientId) => apiClient.get(`/medical-records/patient/${patientId}`);

export const getMedicalRecordsByPatientEmail = (email) => apiClient.get(`/medical-records/patient/email/${encodeURIComponent(email)}`);

export const getMedicalRecord = (id) => apiClient.get(`/medical-records/${id}`);

export const createMedicalRecord = (payload) => apiClient.post('/medical-records', payload);

export const updateMedicalRecord = (id, payload) => apiClient.put(`/medical-records/${id}`, payload);

export const deleteMedicalRecord = (id) => apiClient.delete(`/medical-records/${id}`);

export function getRecordStatus(record) {
  return record?.status || 'ACTIVE';
}

export function buildMedicalRecordPayload(formData) {
  return {
    patientId: Number(formData.patientId),
    diagnosis: formData.diagnosis.trim(),
    allergies: formData.allergies?.trim() || null,
    treatmentPlan: formData.treatmentPlan?.trim() || null,
    notes: formData.notes.trim(),
    doctorNotes: formData.doctorNotes?.trim() || null
  };
}

export function getMedicalRecordInitialFormData(record = {}) {
  const recordDate = record.recordDate || new Date().toISOString().slice(0, 10);

  return {
    patientId: record.patientId || '',
    doctorId: record.doctorId || '',
    doctorName: record.doctorName || '',
    diagnosis: record.diagnosis || '',
    diabetesType: record.diabetesType || '',
    allergies: record.allergies || '',
    symptoms: record.symptoms || '',
    treatmentPlan: record.treatmentPlan || '',
    notes: record.notes || '',
    doctorNotes: record.doctorNotes || '',
    recordDate,
    recordDateTime: record.recordDateTime || `${recordDate}T09:00`,
    status: getRecordStatus(record)
  };
}

export function filterMedicalRecords(records, filters) {
  const search = filters.search.trim().toLowerCase();
  const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const to = filters.dateTo ? new Date(filters.dateTo) : null;

  return records.filter((record) => {
    const recordDate = record.recordDate ? new Date(record.recordDate) : null;
    const matchesSearch =
      !search ||
      record.patientName?.toLowerCase().includes(search) ||
      String(record.patientId || '').includes(search) ||
      record.diagnosis?.toLowerCase().includes(search) ||
      record.allergies?.toLowerCase().includes(search) ||
      record.treatmentPlan?.toLowerCase().includes(search) ||
      record.notes?.toLowerCase().includes(search) ||
      record.doctorNotes?.toLowerCase().includes(search);
    const matchesPatient = filters.patient === 'ALL' || String(record.patientId) === filters.patient || record.patientName === filters.patient;
    const matchesDoctor = filters.doctor === 'ALL' || record.doctorName === filters.doctor || String(record.doctorId || '') === filters.doctor;
    const matchesDiagnosis = filters.diagnosis === 'ALL' || record.diagnosis === filters.diagnosis;
    const matchesFrom = !from || (recordDate && recordDate >= from);
    const matchesTo = !to || (recordDate && recordDate <= to);

    return matchesSearch && matchesPatient && matchesDoctor && matchesDiagnosis && matchesFrom && matchesTo;
  });
}
