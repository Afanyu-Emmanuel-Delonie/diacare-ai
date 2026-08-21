import { MdClose, MdCircle } from 'react-icons/md';
import { categoryLabel, priorityVariant } from '../../../services/notificationService.js';
import useDismissibleUi from '../../../hooks/useDismissibleUi.js';

const PRIORITY_STYLES = {
  CRITICAL: { bar: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', badge: 'bg-[#FEF2F2] text-[#DC2626]' },
  HIGH:     { bar: '#F59E0B', bg: '#FFFBEB', border: '#FCD34D', badge: 'bg-[#FFFBEB] text-[#B45309]' },
  MEDIUM:   { bar: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', badge: 'bg-[#EFF6FF] text-[#1D4ED8]' },
  LOW:      { bar: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', badge: 'bg-[#ECFDF5] text-[#065F46]' },
};

function NotificationCard({ notification, onMarkRead, onDelete }) {
  const { dismissed, dismiss } = useDismissibleUi('notification-card', notification.id);
  if (dismissed) return null;

  const style = PRIORITY_STYLES[notification.priority] || PRIORITY_STYLES.MEDIUM;
  const isUnread = !notification.read;

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: isUnread ? style.border : '#E2E8F0' }}
    >
      {/* Left priority bar */}
      <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl" style={{ backgroundColor: style.bar }} aria-hidden="true" />

      <div className="pl-4 pr-4 py-4 sm:pr-5 sm:py-5">
        {/* Top row: badges + actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${style.badge}`}>
              <MdCircle size={6} aria-hidden="true" />
              {notification.priority}
            </span>
            {/* Category badge */}
            <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
              {categoryLabel(notification.category)}
            </span>
            {/* Unread dot */}
            {isUnread && (
              <span className="flex h-2 w-2 rounded-full bg-[#2563EB]" aria-label="Unread" />
            )}
          </div>

          {/* Dismiss */}
          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#475569]"
            aria-label={`Dismiss: ${notification.title}`}
          >
            <MdClose size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Title + description */}
        <h2 className="mt-3 text-sm font-bold leading-snug text-[#0F172A] sm:text-base">{notification.title}</h2>
        <p className="mt-1.5 text-sm leading-6 text-[#475569]">{notification.description}</p>

        {/* Meta grid */}
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
          <MetaItem label="Date" value={notification.date || '—'} />
          <MetaItem label="Time" value={notification.time || '—'} />
          <MetaItem label="Sender" value={notification.sender} />
          <MetaItem label="Patient" value={notification.relatedPatient} />
        </dl>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#F1F5F9] pt-3">
          <button
            type="button"
            disabled={!isUnread}
            onClick={() => onMarkRead(notification)}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] transition-colors hover:border-[#2563EB]/30 hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark read
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(notification)}
              className="rounded-lg border border-[#FCA5A5]/50 bg-[#FEF2F2] px-3 py-1.5 text-xs font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[#94A3B8]">{label}</dt>
      <dd className="truncate font-medium text-[#334155]">{value || '—'}</dd>
    </div>
  );
}

export default NotificationCard;
