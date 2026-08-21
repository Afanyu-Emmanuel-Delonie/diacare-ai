import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdCalendarMonth, MdLocationOn, MdNotifications,
  MdArrowForward, MdAccessTime,
} from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAppointments, isUpcomingAppointment } from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return null;
  return `In ${days} days`;
}

function fmtDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function fmtTime(v) {
  if (!v) return '';
  return new Date(v).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function AppointmentCard({ appt }) {
  const countdown = daysUntil(appt.scheduledAt);
  const isToday = countdown === 'Today';
  const isTomorrow = countdown === 'Tomorrow';

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${isToday ? 'border-[#2563EB]/40' : 'border-[#334155]/10'}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isToday ? 'bg-[#2563EB]' : 'bg-[#2563EB]/10'}`}>
            <MdCalendarMonth size={20} className={isToday ? 'text-white' : 'text-[#2563EB]'} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1e293b]">{appt.appointmentType || 'Appointment'}</p>
            <p className="text-xs text-[#94a3b8]">{appt.patientName || `Patient #${appt.patientId}`}</p>
          </div>
        </div>
        {countdown && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${isToday ? 'bg-[#2563EB] text-white' : isTomorrow ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
            {countdown}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <MdAccessTime size={14} className="text-[#94a3b8]" />
          <span>{fmtDate(appt.scheduledAt)}{appt.scheduledAt ? ` · ${fmtTime(appt.scheduledAt)}` : ''}</span>
        </div>
        {appt.location && (
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <MdLocationOn size={14} className="text-[#94a3b8]" />
            <span>{appt.location}</span>
          </div>
        )}
        {appt.reminderAt && (
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <MdNotifications size={14} className="text-[#94a3b8]" />
            <span>Reminder: {fmtDate(appt.reminderAt)}</span>
          </div>
        )}
        {appt.reason && (
          <div className="flex items-center gap-2 text-xs text-[#64748b] sm:col-span-2">
            <span className="font-medium text-[#334155]">Reason:</span> {appt.reason}
          </div>
        )}
      </div>

      <Link to={`/dashboard/appointments/${appt.id}`}
        className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline">
        View details <MdArrowForward size={13} />
      </Link>
    </div>
  );
}

function UpcomingAppointments() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAppointments()
      .then((res) => setAppointments(res.data || []))
      .catch((err) => {
        const msg = getApiErrorMessage(err, 'Failed to load upcoming appointments.');
        setError(msg);
        showToast({ type: 'error', message: msg });
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const upcoming = useMemo(() =>
    appointments.filter(isUpcomingAppointment)
      .sort((a, b) => String(a.scheduledAt || '').localeCompare(String(b.scheduledAt || ''))),
    [appointments]
  );

  const today = upcoming.filter((a) => daysUntil(a.scheduledAt) === 'Today');
  const rest = upcoming.filter((a) => daysUntil(a.scheduledAt) !== 'Today');

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Upcoming Appointments</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">Scheduled visits, reminders, and consultation details.</p>
        </div>
        <Link to="/dashboard/appointments">
          <button type="button" className="rounded-xl border border-[#334155]/15 bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-sm hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
            All appointments
          </button>
        </Link>
      </div>

      {error && <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}

      {!error && upcoming.length === 0 && (
        <EmptyState title="No upcoming appointments" message="There are no scheduled appointments to show right now." />
      )}

      {today.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">Today</span>
            <div className="flex-1 border-t border-[#e2e8f0]" />
            <span className="rounded-full bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">{today.length}</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {today.map((a) => <AppointmentCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div>
          {today.length > 0 && (
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-[#64748b]">Upcoming</span>
              <div className="flex-1 border-t border-[#e2e8f0]" />
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {rest.map((a) => <AppointmentCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingAppointments;
