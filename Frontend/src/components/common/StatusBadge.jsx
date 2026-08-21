import Badge from './Badge.jsx';

function statusVariant(status) {
  const value = String(status || '').toUpperCase();

  if (['ACTIVE', 'SUCCESS', 'COMPLETED', 'TAKEN', 'READ', 'NORMAL', 'OK'].includes(value)) {
    return 'success';
  }

  if (['WARNING', 'PENDING', 'UPCOMING', 'UNREAD', 'INACTIVE', 'MISSED', 'ARCHIVED'].includes(value)) {
    return 'warning';
  }

  if (['CRITICAL', 'ERROR', 'FAILURE', 'FAILED', 'DELETED', 'LOCKED', 'CANCELLED', 'EMERGENCY'].includes(value)) {
    return 'critical';
  }

  return 'info';
}

function StatusBadge({ status, children }) {
  const label = children || String(status || 'INFO').replaceAll('_', ' ');
  return <Badge variant={statusVariant(status)}>{label}</Badge>;
}

export default StatusBadge;
