import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdAdd, MdSearch, MdCalendarMonth, MdCheckCircle,
  MdCancel, MdSchedule, MdChevronLeft, MdChevronRight,
  MdInfoOutline, MdEditCalendar, MdEventAvailable, MdEventBusy,
} from 'react-icons/md';
import ActionsMenu from '../../../components/common/ActionsMenu.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  appointmentStatuses, cancelAppointment, filterAppointments,
  getAppointments, getAppointmentsByPatient, updateAppointmentStatus,
} from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

const PAGE_SIZE = 10;

const STATUS_META = {
  UPCOMING:  { color: '#2563EB', bg: '#2563EB15', label: 'Upcoming' },
  COMPLETED: { color: '#10B981', bg: '#10B98115', label: 'Completed' },
  CANCELLED: { color: '#94a3b8', bg: '#94a3b815', label: 'Cancelled' },
  MISSED:    { color: '#DC2626', bg: '#DC262615', label: 'Missed' },
};

function statusMeta(s) { return STATUS_META[s] || STATUS_META.UPCOMING; }

function fmtDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#334155]/10 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium text-[#64748b]">{label}</p>
        <p className="text-xl font-bold text-[#1e293b]">{value}</p>
      </div>
    </div>
  );
}

function AppointmentRow({ appt, canManage, onStatus, onCancel, navigate }) {
  const meta = statusMeta(appt.status);
  return (
    <tr className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10">
            <MdCalendarMonth size={15} className="text-[#2563EB]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1e293b]">{appt.appointmentType || 'Appointment'}</p>
            <p className="text-xs text-[#94a3b8]">{fmtDate(appt.scheduledAt)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#334155]">{appt.patientName || `Patient #${appt.patientId}`}</td>
      <td className="px-4 py-3 text-sm text-[#64748b]">{appt.location || '—'}</td>
      <td className="px-4 py-3 text-xs text-[#94a3b8]">{fmtDate(appt.reminderAt)}</td>
      <td className="px-4 py-3">
        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <ActionsMenu
          items={[
            { key: 'details', label: 'More details', icon: MdInfoOutline, onClick: () => navigate(`/dashboard/appointments/${appt.id}`) },
            canManage && { key: 'reschedule', label: 'Reschedule', icon: MdEditCalendar, onClick: () => navigate(`/dashboard/appointments/${appt.id}/edit`) },
            canManage && { key: 'complete', label: 'Mark completed', icon: MdEventAvailable, onClick: () => onStatus(appt, 'COMPLETED') },
            canManage && { key: 'missed', label: 'Mark missed', icon: MdEventBusy, onClick: () => onStatus(appt, 'MISSED') },
            appt.status !== 'CANCELLED' && { key: 'cancel', label: 'Cancel', icon: MdCancel, danger: true, onClick: () => onCancel(appt) },
          ]}
        />
      </td>
    </tr>
  );
}

function AppointmentList() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [cancelDialog, setCancelDialog] = useState({ open: false, appt: null });

  const canCreate = [ROLES.PATIENT, ROLES.DOCTOR, ROLES.NURSE].includes(userRole);
  const canManage = [ROLES.DOCTOR, ROLES.NURSE].includes(userRole);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = patientId ? await getAppointmentsByPatient(patientId) : await getAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load appointments.');
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  const filtered = useMemo(() =>
    filterAppointments(appointments, { search, patient: 'ALL', doctor: 'ALL', status: statusFilter, appointmentType: 'ALL', dateFrom: '', dateTo: '' }),
    [appointments, search, statusFilter]
  );

  useEffect(() => setPage(0), [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const onStatus = async (appt, status) => {
    try {
      await updateAppointmentStatus(appt.id, { status });
      showToast({ type: 'success', message: `Appointment marked ${status.toLowerCase()}.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', message: getApiErrorMessage(err, 'Failed to update status.') });
    }
  };

  const onCancel = async (appt) => {
    try {
      await cancelAppointment(appt.id);
      showToast({ type: 'success', message: 'Appointment cancelled.' });
      setCancelDialog({ open: false, appt: null });
      await load();
    } catch (err) {
      showToast({ type: 'error', message: getApiErrorMessage(err, 'Failed to cancel appointment.') });
    }
  };

  const counts = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter((a) => a.status === 'UPCOMING').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    missed: appointments.filter((a) => a.status === 'MISSED').length,
  }), [appointments]);

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-[#1e293b]">Appointment Management</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">View, schedule, reschedule, and track appointments.</p>
        </div>
        {canCreate && (
          <Link to={patientId ? `/dashboard/appointments/new?patientId=${patientId}` : '/dashboard/appointments/new'}>
            <button type="button" className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors">
              <MdAdd size={16} /> New Appointment
            </button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={counts.total} color="#2563EB" icon={MdCalendarMonth} />
        <StatCard label="Upcoming" value={counts.upcoming} color="#2563EB" icon={MdSchedule} />
        <StatCard label="Completed" value={counts.completed} color="#10B981" icon={MdCheckCircle} />
        <StatCard label="Missed" value={counts.missed} color="#DC2626" icon={MdCancel} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-[#334155]/10 bg-white px-3 py-2">
          <MdSearch size={16} className="text-[#94a3b8]" />
          <input type="text" placeholder="Search patient, type, location..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#94a3b8]" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[#334155]/10 bg-white p-1">
          {['ALL', ...appointmentStatuses].map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-[#2563EB] text-white' : 'text-[#64748b] hover:text-[#1e293b]'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}

      {!error && filtered.length === 0 && <EmptyState title="No appointments found" message="No appointments match the current filters." />}

      {!error && filtered.length > 0 && (
        <div className="rounded-xl border border-[#334155]/10 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="mobile-card-table appointment-list-table w-full text-left">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  {['Appointment', 'Patient', 'Location', 'Reminder', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748b]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((appt) => (
                  <AppointmentRow key={appt.id} appt={appt} canManage={canManage}
                    onStatus={onStatus} onCancel={(a) => setCancelDialog({ open: true, appt: a })} navigate={navigate} />
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#f1f5f9] px-5 py-3">
              <span className="text-xs text-[#94a3b8]">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-1">
                <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-[#334155]/15 p-1.5 text-[#64748b] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 transition-colors">
                  <MdChevronLeft size={16} />
                </button>
                <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[#334155]/15 p-1.5 text-[#64748b] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-40 transition-colors">
                  <MdChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={cancelDialog.open}
        title="Cancel appointment"
        message={`Cancel ${cancelDialog.appt?.appointmentType || 'this appointment'} for ${cancelDialog.appt?.patientName || 'this patient'}?`}
        confirmLabel="Cancel appointment"
        onConfirm={() => cancelDialog.appt && onCancel(cancelDialog.appt)}
        onCancel={() => setCancelDialog({ open: false, appt: null })}
      />
    </div>
  );
}

export default AppointmentList;
