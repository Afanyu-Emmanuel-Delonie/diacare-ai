import apiClient from '../api/axiosConfig.js';

function cleanParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );
}

export async function getAdminSystemReport(filters) {
  const response = await apiClient.get('/reports/admin/system', { params: cleanParams(filters) });
  return response.data;
}

export async function getAdminSecurityAuditReport(filters) {
  const response = await apiClient.get('/reports/admin/audit', { params: cleanParams(filters) });
  return response.data;
}

export async function getAuditLogs(filters) {
  const response = await apiClient.get('/audit/logs', { params: cleanParams(filters) });
  return response.data || [];
}

export async function getDoctorPatientReport(patientId) {
  const response = await apiClient.get(`/reports/doctor/patient/${patientId}`);
  return response.data;
}

export async function getNursePatientReport(patientId) {
  const response = await apiClient.get(`/reports/nurse/patient/${patientId}`);
  return response.data;
}

export async function getCaregiverPatientReport(patientId) {
  const response = await apiClient.get(`/reports/caregiver/patient/${patientId}`);
  return response.data;
}

export async function getPatientHealthReport() {
  const response = await apiClient.get('/reports/patient/my-report');
  return response.data;
}

export async function getReports(filters) {
  const response = await apiClient.post('/reports/filter', cleanParams(filters));
  return response.data || [];
}

export async function getReportHistory() {
  const response = await apiClient.get('/reports/history');
  return response.data || [];
}

export async function filterReportHistory(filters) {
  const response = await apiClient.post('/reports/history/filter', cleanParams(filters));
  return response.data || [];
}

export async function downloadReportFile(reportId, format = 'JSON') {
  const endpoints = {
    JSON: `/reports/download/${reportId}`,
    PDF: `/reports/export/pdf/${reportId}`,
    EXCEL: `/reports/export/excel/${reportId}`,
    CSV: `/reports/export/csv/${reportId}`
  };

  const response = await apiClient.get(endpoints[format] || endpoints.JSON, {
    responseType: 'blob'
  });

  const disposition = response.headers['content-disposition'] || '';
  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
  const extension = format === 'EXCEL' ? 'xlsx' : format.toLowerCase();
  const fileName = fileNameMatch?.[1] || `report-${reportId}.${extension}`;
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
