import apiClient from '../api/axiosConfig.js';

function cleanParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );
}

export async function getAuditLogs(filters) {
  const response = await apiClient.get('/audit/logs', { params: cleanParams(filters) });
  return response.data || [];
}
