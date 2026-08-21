import apiClient from '../api/axiosConfig.js';

export const getAppointments = () => apiClient.get('/appointments');

export const getAppointmentsByPatient = (patientId) => apiClient.get(`/appointments/patient/${patientId}`);

export const getAppointment = (id) => apiClient.get(`/appointments/${id}`);

export const createAppointment = (payload) => apiClient.post('/appointments', payload);

export const updateAppointment = (id, payload) => apiClient.put(`/appointments/${id}`, payload);

export const rescheduleAppointment = (id, payload) => apiClient.patch(`/appointments/${id}/reschedule`, payload);

export const updateAppointmentStatus = (id, payload) => apiClient.patch(`/appointments/${id}/status`, payload);

export const cancelAppointment = (id) => apiClient.patch(`/appointments/${id}/cancel`);

export const appointmentStatuses = ['UPCOMING', 'COMPLETED', 'CANCELLED', 'MISSED'];

export const appointmentTypes = [
  'Routine checkup',
  'Diabetes follow-up',
  'Medication review',
  'Lab result review',
  'Emergency follow-up',
  'General consultation'
];

export function getAppointmentDate(appointment) {
  return appointment?.scheduledAt?.slice(0, 10) || '';
}

export function isUpcomingAppointment(appointment) {
  return appointment?.status === 'UPCOMING' && (!appointment.scheduledAt || new Date(appointment.scheduledAt) >= new Date());
}

export function isHistoricalAppointment(appointment) {
  return ['COMPLETED', 'CANCELLED', 'MISSED'].includes(appointment?.status) || (appointment?.scheduledAt && new Date(appointment.scheduledAt) < new Date());
}

export function filterAppointments(appointments, filters) {
  const search = filters.search.trim().toLowerCase();

  return appointments.filter((appointment) => {
    const date = getAppointmentDate(appointment);
    const matchesSearch =
      !search ||
      appointment.patientName?.toLowerCase().includes(search) ||
      appointment.appointmentType?.toLowerCase().includes(search) ||
      appointment.reason?.toLowerCase().includes(search) ||
      appointment.location?.toLowerCase().includes(search);
    const matchesPatient = filters.patient === 'ALL' || String(appointment.patientId) === filters.patient || appointment.patientName === filters.patient;
    const matchesDoctor = filters.doctor === 'ALL' || appointment.doctorName === filters.doctor || String(appointment.doctorId || '') === filters.doctor;
    const matchesStatus = filters.status === 'ALL' || appointment.status === filters.status;
    const matchesType = filters.appointmentType === 'ALL' || appointment.appointmentType === filters.appointmentType;
    const matchesFrom = !filters.dateFrom || date >= filters.dateFrom;
    const matchesTo = !filters.dateTo || date <= filters.dateTo;

    return matchesSearch && matchesPatient && matchesDoctor && matchesStatus && matchesType && matchesFrom && matchesTo;
  });
}
