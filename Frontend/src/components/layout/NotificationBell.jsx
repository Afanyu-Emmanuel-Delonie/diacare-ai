import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdNotifications, MdClose, MdDoneAll, MdCircle,
  MdArrowForward, MdCheckCircle,
} from 'react-icons/md';
import useToast from '../../hooks/useToast.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import {
  categoryLabel, getNotifications, markAllNotificationsRead,
  markNotificationRead, priorityVariant,
} from '../../services/notificationService.js';
import { getApiErrorMessage } from '../../utils/apiErrors.js';
import { isUiItemDismissed, persistUiItemDismissal } from '../../utils/uiStateStorage.js';

const PRIORITY_BAR = {
  CRITICAL: '#DC2626',
  HIGH:     '#F59E0B',
  MEDIUM:   '#2563EB',
  LOW:      '#10B981',
};

function NotificationBell() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      showToast({ type: 'error', message: getApiErrorMessage(e, 'Unable to load notifications.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const visible = useMemo(
    () => notifications.filter(
      (n) => !dismissedIds.has(String(n.id)) && !isUiItemDismissed('notification-drawer', n.id)
    ),
    [dismissedIds, notifications]
  );

  const dismiss = (n) => {
    persistUiItemDismissal('notification-drawer', n.id);
    setDismissedIds((s) => new Set([...s, String(n.id)]));
  };

  const markRead = async (n) => {
    try {
      await markNotificationRead(n.id);
      await load();
    } catch (e) {
      showToast({ type: 'error', message: getApiErrorMessage(e, 'Unable to mark as read.') });
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead(notifications.filter((n) => !n.read));
      await load();
      showToast({ type: 'success', message: 'All notifications marked as read.' });
    } catch (e) {
      showToast({ type: 'error', message: getApiErrorMessage(e, 'Failed to mark all as read.') });
    }
  };

  const preview = visible.slice(0, 6);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <MdNotifications size={22} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl shadow-[#0f172a]/10 overflow-hidden"
          role="dialog"
          aria-label="Notifications panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
            <div className="flex items-center gap-2">
              <MdNotifications size={18} className="text-[#2563EB]" />
              <span className="text-sm font-bold text-[#0F172A]">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#2563EB]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAll}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#2563EB] transition-colors"
                  title="Mark all as read"
                >
                  <MdDoneAll size={14} /> All read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors"
                aria-label="Close notifications"
              >
                <MdClose size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F1F5F9]" />
                ))}
              </div>
            )}

            {!loading && preview.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9]">
                  <MdCheckCircle size={24} className="text-[#94A3B8]" />
                </div>
                <p className="text-sm font-semibold text-[#475569]">All caught up</p>
                <p className="text-xs text-[#94A3B8]">No notifications to show.</p>
              </div>
            )}

            {!loading && preview.map((n) => {
              const barColor = PRIORITY_BAR[n.priority] || '#2563EB';
              const isUnread = !n.read;
              return (
                <div
                  key={n.id}
                  className={`relative flex gap-3 border-b border-[#F8FAFC] px-4 py-3 transition-colors hover:bg-[#F8FAFC] ${isUnread ? 'bg-[#FAFCFF]' : 'bg-white'}`}
                >
                  {/* Priority bar */}
                  <div className="absolute inset-y-0 left-0 w-0.5" style={{ backgroundColor: barColor }} aria-hidden="true" />

                  {/* Icon */}
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${barColor}15` }}
                  >
                    <MdCircle size={10} style={{ color: barColor }} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-[#0F172A]' : 'font-medium text-[#334155]'}`}>
                        {n.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => dismiss(n)}
                        className="shrink-0 text-[#CBD5E1] hover:text-[#94A3B8] transition-colors"
                        aria-label={`Dismiss: ${n.title}`}
                      >
                        <MdClose size={14} />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-[#64748B]">{categoryLabel(n.category)}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#94A3B8]">{n.date} {n.time}</span>
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markRead(n)}
                          className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-[#F1F5F9] p-3">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#EFF6FF] hover:text-[#2563EB]"
            >
              View all notifications <MdArrowForward size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
