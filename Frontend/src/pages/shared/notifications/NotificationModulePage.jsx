import { useEffect, useMemo, useState } from 'react';
import {
  MdNotifications, MdDoneAll, MdSearch, MdTune,
  MdCircle, MdCheckCircle, MdWarning, MdError,
} from 'react-icons/md';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  categoryLabel,
  deleteNotificationIfAllowed,
  filterNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationSummary,
  priorityVariant,
} from '../../../services/notificationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import NotificationCard from './NotificationCard.jsx';

const PRIORITY_TABS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const CATEGORY_OPTIONS = [
  'ALL', 'MEDICATION_REMINDER', 'APPOINTMENT_REMINDER', 'BLOOD_GLUCOSE_ALERT',
  'AI_RISK_ALERT', 'EMERGENCY_ALERT', 'LABORATORY_RESULT_NOTIFICATION',
  'DOCTOR_REVIEW_NOTIFICATION', 'GENERAL_SYSTEM_NOTIFICATION',
];
const PAGE_SIZE = 12;

const STAT_CONFIG = [
  { key: 'total',     label: 'Total',     icon: MdNotifications, color: '#2563EB', bg: '#EFF6FF' },
  { key: 'unread',    label: 'Unread',    icon: MdCircle,        color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'critical',  label: 'Critical',  icon: MdError,         color: '#DC2626', bg: '#FEF2F2' },
  { key: 'reminders', label: 'Reminders', icon: MdCheckCircle,   color: '#10B981', bg: '#ECFDF5' },
];

function NotificationModulePage({
  title = 'Notification Center',
  eyebrow = 'Notifications',
  description = 'Review healthcare alerts and reminders.',
  fixedCategory = 'ALL',
  historyOnly = false,
  criticalOnly = false,
  showDelete = false,
  banner,
}) {
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [priorityTab, setPriorityTab] = useState('ALL');
  const [category, setCategory] = useState(fixedCategory);
  const [readFilter, setReadFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, notification: null });

  const canDelete = showDelete && [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE].includes(userRole);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getNotifications();
      const data = res.data || [];
      setNotifications(data);
      const critCount = data.filter((n) => !n.read && n.priority === 'CRITICAL').length;
      if (critCount > 0) showToast({ type: 'warning', message: `${critCount} critical alert${critCount > 1 ? 's' : ''} need review.` });
    } catch (e) {
      const msg = getApiErrorMessage(e, 'Failed to load notifications.');
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const scoped = useMemo(() => {
    let items = notifications;
    if (fixedCategory !== 'ALL') items = items.filter((n) => n.category === fixedCategory);
    if (historyOnly) items = items.filter((n) => n.read);
    if (criticalOnly) items = items.filter((n) => n.priority === 'CRITICAL' || n.category === 'EMERGENCY_ALERT');
    return items;
  }, [notifications, fixedCategory, historyOnly, criticalOnly]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoped.filter((n) => {
      const matchSearch = !q || n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q) || n.relatedPatient?.toLowerCase().includes(q) || n.sender?.toLowerCase().includes(q);
      const matchPriority = priorityTab === 'ALL' || n.priority === priorityTab;
      const matchCat = category === 'ALL' || n.category === category;
      const matchRead = readFilter === 'ALL' || (readFilter === 'UNREAD' && !n.read) || (readFilter === 'READ' && n.read);
      return matchSearch && matchPriority && matchCat && matchRead;
    });
  }, [scoped, search, priorityTab, category, readFilter]);

  const summary = useMemo(() => notificationSummary(scoped), [scoped]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, priorityTab, category, readFilter]);

  const markRead = async (n) => {
    try {
      await markNotificationRead(n.id);
      showToast({ type: 'success', message: 'Marked as read.' });
      await load();
    } catch (e) {
      showToast({ type: 'error', message: getApiErrorMessage(e, 'Failed to mark as read.') });
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead(scoped);
      showToast({ type: 'success', message: 'All notifications marked as read.' });
      await load();
    } catch (e) {
      showToast({ type: 'error', message: getApiErrorMessage(e, 'Failed to mark all as read.') });
    }
  };

  const doDelete = async () => {
    if (!deleteDialog.notification) return;
    try {
      await deleteNotificationIfAllowed(deleteDialog.notification.id);
      showToast({ type: 'success', message: 'Notification deleted.' });
      setDeleteDialog({ open: false, notification: null });
      await load();
    } catch (e) {
      showToast({ type: 'error', message: getApiErrorMessage(e, 'Unable to delete.') });
      setDeleteDialog({ open: false, notification: null });
    }
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold text-[#0F172A]">{title}</h1>
          <p className="mt-1 text-sm text-[#64748B]">{description}</p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={summary.unread === 0}
          className="flex items-center gap-2 self-start rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] shadow-sm transition-colors hover:border-[#2563EB]/30 hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MdDoneAll size={18} /> Mark all read
        </button>
      </div>

      {banner && (
        <div className="rounded-xl border border-[#FCD34D] bg-[#FFFBEB] px-4 py-3 text-sm font-medium text-[#92400E]">
          {banner.message || banner}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: bg }}>
                <Icon size={16} style={{ color }} aria-hidden="true" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold" style={{ color }}>{summary[key]}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        {/* Search + read filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 items-center gap-2.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 shadow-sm transition focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/10">
            <MdSearch size={18} className="shrink-0 text-[#94A3B8]" aria-hidden="true" />
            <span className="sr-only">Search notifications</span>
            <input
              type="search"
              placeholder="Search title, patient, sender…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            />
          </label>
          <div className="flex gap-2">
            {['ALL', 'UNREAD', 'READ'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setReadFilter(s)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors sm:flex-none sm:px-4 ${
                  readFilter === s
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/30 hover:text-[#2563EB]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Priority tabs */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            <MdTune size={14} /> Priority
          </span>
          {PRIORITY_TABS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityTab(p)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                priorityTab === p
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]/30 hover:text-[#2563EB]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Category select */}
        {fixedCategory === 'ALL' && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-[#64748B] whitespace-nowrap">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All categories' : categoryLabel(c)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-xs text-[#94A3B8]">
          Showing {visible.length} of {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {loading && <LoadingSkeleton rows={4} />}
      {!loading && error && <EmptyState title="Could not load notifications" message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No notifications" message="No notifications match the selected filters." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={markRead}
              onDelete={canDelete ? (item) => setDeleteDialog({ open: true, notification: item }) : null}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-4">
          <p className="text-xs text-[#94A3B8]">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] disabled:opacity-40 hover:border-[#2563EB]/30 hover:text-[#2563EB]"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] disabled:opacity-40 hover:border-[#2563EB]/30 hover:text-[#2563EB]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete notification"
        message="Delete this notification? This only removes the notification record, not the related healthcare data."
        confirmLabel="Delete"
        onConfirm={doDelete}
        onCancel={() => setDeleteDialog({ open: false, notification: null })}
      />
    </div>
  );
}

export default NotificationModulePage;
