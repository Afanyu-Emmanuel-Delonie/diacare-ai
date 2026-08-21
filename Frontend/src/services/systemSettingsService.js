import apiClient from '../api/axiosConfig.js';

export async function getReportBranding() {
  const response = await apiClient.get('/settings/report-branding');
  return response.data;
}

export async function updateReportBranding(payload) {
  const response = await apiClient.put('/settings/report-branding', payload);
  return response.data;
}
