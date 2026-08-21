import apiClient from '../api/axiosConfig.js';

export const notificationCategories = [
  'ALL',
  'MEDICATION_REMINDER',
  'APPOINTMENT_REMINDER',
  'BLOOD_GLUCOSE_ALERT',
  'AI_RISK_ALERT',
  'EMERGENCY_ALERT',
  'LABORATORY_RESULT_NOTIFICATION',
  'DOCTOR_REVIEW_NOTIFICATION',
  'GENERAL_SYSTEM_NOTIFICATION'
];

export const priorityLevels = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const readStatuses = ['ALL', 'UNREAD', 'READ'];

export const getNotifications = async () => {
  const response = await apiClient.get('/alerts');
  return { ...response, data: (response.data || []).map(normalizeNotification) };
};

export const getNotificationsByPatient = async (patientId) => {
  const response = await apiClient.get(`/alerts/patient/${patientId}`);
  return { ...response, data: (response.data || []).map(normalizeNotification) };
};

export const createNotification = (payload) => apiClient.post('/alerts', payload);

export const markNotificationRead = (id) => apiClient.patch(`/alerts/${id}/read`);

export const deleteNotification = (id) => apiClient.delete(`/alerts/${id}`);

export async function markAllNotificationsRead(notifications) {
  const unread = notifications.filter((notification) => !notification.read);
  await Promise.all(unread.map((notification) => markNotificationRead(notification.id)));
}

export async function deleteNotificationIfAllowed(id) {
  return deleteNotification(id);
}

export function normalizeNotification(notification = {}) {
  const category = normalizeCategory(notification.notificationType, notification.title, notification.message);
  const priority = normalizePriority(notification.severity, category);
  const dateTime = notification.createdAt || notification.reminderAt || notification.dateTime || '';

  return {
    ...notification,
    id: notification.id,
    title: notification.title || 'Notification',
    description: notification.description || notification.message || 'No data available for this section.',
    message: notification.message || notification.description || 'No data available for this section.',
    category,
    priority,
    notificationType: notification.notificationType || category,
    severity: notification.severity || priorityToSeverity(priority),
    read: Boolean(notification.read),
    sender: notification.sender || notification.createdBy || 'System',
    relatedPatient: notification.relatedPatient || notification.patientName || 'Not assigned',
    date: dateTime ? dateTime.slice(0, 10) : '',
    time: dateTime ? dateTime.slice(11, 16) : '',
    createdAt: notification.createdAt,
    reminderAt: notification.reminderAt,
    readAt: notification.readAt
  };
}

export function filterNotifications(notifications, filters) {
  const search = String(filters.search || '').trim().toLowerCase();

  return notifications.filter((notification) => {
    const matchesSearch =
      !search ||
      notification.title?.toLowerCase().includes(search) ||
      notification.description?.toLowerCase().includes(search) ||
      notification.relatedPatient?.toLowerCase().includes(search) ||
      notification.sender?.toLowerCase().includes(search);
    const matchesCategory = !filters.category || filters.category === 'ALL' || notification.category === filters.category;
    const matchesPriority = !filters.priority || filters.priority === 'ALL' || notification.priority === filters.priority;
    const matchesRead =
      !filters.readStatus ||
      filters.readStatus === 'ALL' ||
      (filters.readStatus === 'READ' && notification.read) ||
      (filters.readStatus === 'UNREAD' && !notification.read);
    const matchesFrom = !filters.dateFrom || notification.date >= filters.dateFrom;
    const matchesTo = !filters.dateTo || notification.date <= filters.dateTo;

    return matchesSearch && matchesCategory && matchesPriority && matchesRead && matchesFrom && matchesTo;
  });
}

export function normalizeCategory(type, title = '', message = '') {
  const value = String(type || '').toUpperCase();
  const text = `${title} ${message}`.toLowerCase();

  if (value === 'MEDICATION_REMINDER') return 'MEDICATION_REMINDER';
  if (value === 'APPOINTMENT_REMINDER') return 'APPOINTMENT_REMINDER';
  if (value === 'AI_RISK') return 'AI_RISK_ALERT';
  if (value === 'EMERGENCY') return 'EMERGENCY_ALERT';
  if (text.includes('glucose') || text.includes('blood sugar')) return 'BLOOD_GLUCOSE_ALERT';
  if (text.includes('laboratory') || text.includes('lab result')) return 'LABORATORY_RESULT_NOTIFICATION';
  if (text.includes('doctor review') || text.includes('doctor comment')) return 'DOCTOR_REVIEW_NOTIFICATION';

  return 'GENERAL_SYSTEM_NOTIFICATION';
}

export function normalizePriority(severity, category) {
  const value = String(severity || '').toUpperCase();
  if (value === 'CRITICAL' || category === 'EMERGENCY_ALERT') return 'CRITICAL';
  if (value === 'WARNING') return 'HIGH';
  if (value === 'SUCCESS') return 'LOW';
  return 'MEDIUM';
}

export function priorityVariant(priority) {
  if (priority === 'LOW') return 'success';
  if (priority === 'MEDIUM') return 'info';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'CRITICAL') return 'critical';
  return 'info';
}

export function categoryLabel(category) {
  return String(category || 'GENERAL_SYSTEM_NOTIFICATION').replaceAll('_', ' ');
}

export function priorityToSeverity(priority) {
  if (priority === 'LOW') return 'SUCCESS';
  if (priority === 'HIGH') return 'WARNING';
  if (priority === 'CRITICAL') return 'CRITICAL';
  return 'INFO';
}

export function notificationSummary(notifications) {
  return {
    total: notifications.length,
    unread: notifications.filter((notification) => !notification.read).length,
    critical: notifications.filter((notification) => notification.priority === 'CRITICAL').length,
    reminders: notifications.filter((notification) => ['MEDICATION_REMINDER', 'APPOINTMENT_REMINDER'].includes(notification.category)).length
  };
}
