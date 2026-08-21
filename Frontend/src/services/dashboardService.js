import apiClient from '../api/axiosConfig.js';

const endpointByRole = {
  ADMIN: '/dashboard/admin',
  DOCTOR: '/dashboard/doctor',
  NURSE: '/dashboard/nurse',
  CAREGIVER: '/dashboard/caregiver',
  PATIENT: '/dashboard/patient'
};

const emptyDashboardData = {
  stats: [],
  activities: [],
  alerts: [],
  chart: [],
  table: [],
  sections: {}
};

export async function getDashboardData(role) {
  const endpoint = endpointByRole[role];

  if (!endpoint) {
    return emptyDashboardData;
  }

  try {
    const response = await apiClient.get(endpoint);
    return {
      ...emptyDashboardData,
      ...response.data
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return emptyDashboardData;
    }

    throw error;
  }
}
