import apiClient from '../api/axiosConfig.js';
import { ROLES } from '../utils/roles.js';

export const messageStatuses = ['ALL', 'UNREAD', 'READ'];

export const getMessages = async () => {
  const response = await apiClient.get('/messages');
  return { ...response, data: (response.data || []).map(normalizeMessage) };
};

export const getMessagesByPatient = async (patientId) => {
  const response = await apiClient.get(`/messages/patient/${patientId}`);
  return { ...response, data: (response.data || []).map(normalizeMessage) };
};

export const getMessage = async (id) => {
  const response = await apiClient.get(`/messages/${id}`);
  return { ...response, data: normalizeMessage(response.data) };
};

export const sendMessage = (payload) => apiClient.post('/messages', payload);

export const markMessageRead = (id) => apiClient.patch(`/messages/${id}/read`);

export const deleteMessage = (id) => apiClient.delete(`/messages/${id}`);

export function normalizeMessage(message = {}) {
  const sentAt = message.sentAt || message.createdAt || '';

  return {
    ...message,
    id: message.id,
    patientId: message.patientId || '',
    patientName: message.patientName || (message.patientId ? `Patient #${message.patientId}` : 'Not assigned'),
    subject: message.subject || 'No subject',
    content: message.content || message.message || 'No message content available.',
    senderEmail: message.senderEmail || 'Unknown sender',
    senderRole: message.senderRole || 'USER',
    recipientRole: message.recipientRole || 'USER',
    receiver: message.receiver || message.recipientEmail || message.recipientRole || 'Recipient',
    attachmentUrl: message.attachmentUrl || message.attachment || '',
    read: Boolean(message.read),
    sentAt,
    date: sentAt ? sentAt.slice(0, 10) : '',
    time: sentAt ? sentAt.slice(11, 16) : '',
    readAt: message.readAt || ''
  };
}

export function buildConversations(messages) {
  const byPatient = messages.reduce((groups, message) => {
    const key = String(message.patientId || 'general');
    return {
      ...groups,
      [key]: [...(groups[key] || []), message]
    };
  }, {});

  return Object.entries(byPatient)
    .map(([patientId, items]) => {
      const sorted = [...items].sort((first, second) => String(second.sentAt || '').localeCompare(String(first.sentAt || '')));
      const latest = sorted[0];

      return {
        id: patientId,
        patientId: patientId === 'general' ? '' : patientId,
        patientName: latest.patientName,
        subject: latest.subject,
        latestMessage: latest.content,
        latestSender: latest.senderEmail,
        latestSenderRole: latest.senderRole,
        latestAt: latest.sentAt,
        unreadCount: items.filter((message) => !message.read).length,
        messages: sorted,
        participants: Array.from(new Set(items.flatMap((message) => [message.senderRole, message.recipientRole]).filter(Boolean))).join(', ')
      };
    })
    .sort((first, second) => String(second.latestAt || '').localeCompare(String(first.latestAt || '')));
}

export function filterMessages(messages, filters) {
  const search = String(filters.search || '').trim().toLowerCase();

  return messages.filter((message) => {
    const matchesSearch =
      !search ||
      message.subject?.toLowerCase().includes(search) ||
      message.content?.toLowerCase().includes(search) ||
      message.patientName?.toLowerCase().includes(search) ||
      message.senderEmail?.toLowerCase().includes(search) ||
      message.senderRole?.toLowerCase().includes(search) ||
      message.recipientRole?.toLowerCase().includes(search);
    const matchesStatus =
      !filters.status ||
      filters.status === 'ALL' ||
      (filters.status === 'READ' && message.read) ||
      (filters.status === 'UNREAD' && !message.read);
    const matchesPatient = !filters.patientId || String(message.patientId) === String(filters.patientId);

    return matchesSearch && matchesStatus && matchesPatient;
  });
}

export function filterConversations(conversations, filters) {
  const search = String(filters.search || '').trim().toLowerCase();

  return conversations.filter((conversation) => {
    const matchesSearch =
      !search ||
      conversation.patientName?.toLowerCase().includes(search) ||
      conversation.subject?.toLowerCase().includes(search) ||
      conversation.latestMessage?.toLowerCase().includes(search) ||
      conversation.participants?.toLowerCase().includes(search);
    const matchesStatus =
      !filters.status ||
      filters.status === 'ALL' ||
      (filters.status === 'UNREAD' && conversation.unreadCount > 0) ||
      (filters.status === 'READ' && conversation.unreadCount === 0);

    return matchesSearch && matchesStatus;
  });
}

export function recipientOptionsFor(role) {
  if (role === ROLES.PATIENT) return [ROLES.DOCTOR];
  if (role === ROLES.DOCTOR) return [ROLES.PATIENT, ROLES.NURSE, ROLES.CAREGIVER];
  if (role === ROLES.NURSE) return [ROLES.DOCTOR, ROLES.CAREGIVER];
  if (role === ROLES.CAREGIVER) return [ROLES.DOCTOR, ROLES.NURSE];
  if (role === ROLES.ADMIN) return [ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT];
  return [];
}

export function canDeleteMessages(role) {
  return [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE].includes(role);
}

export function buildMessagePayload(formData) {
  return {
    patientId: Number(formData.patientId),
    subject: formData.subject.trim(),
    content: formData.content.trim(),
    recipientRole: formData.recipientRole
  };
}

export function formatMessageDate(value) {
  return value ? value.replace('T', ' ').slice(0, 16) : 'Not set';
}
