import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useToast from '../../../hooks/useToast.js';
import { filterAppointments, getAppointments, isHistoricalAppointment } from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

const PAGE_SIZE = 10;

const STATUS_META = {
  COMPLETED: { color: '#10B981', label: 'Completed' },
  CANCELLED: { color: '#94a3b8', label: 'Cancelled' },
  MISSED:    { color: '#DC2626', label: 'Missed' },
};

function fmtDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function AppointmentHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  useEffect(() => {
    getAppointments()
      .then((res) => setAppointments(res.data || []))
      .catch((err) => {
        const msg = getApiErrorMessage(err, 'Failed to load appointment history.');
        setError(msg);
        showToast({ type: 'error', message: msg });
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = useMemo(() =>
    filterAppointments(appointments.filter(isHistoricalAppointment), {
      search, patient: 'ALL', doctor: 'ALL',
      status: statusFilter, appointmentType: 'ALL', dateFrom, dateTo,
    }).sort((a, b) => String(b.scheduledAt || '').localeCompare(String(a.scheduledAt || ''))),
    [appointments, search, dateFrom, dateTo, statusFilter]
  );

  useEffect(() => setPage(0), [search, dateFrom, dateTo, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const counts = useMemo(() => ({
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
    missed: appointments.filter((a) => a.status === 'MISSED').length,
  }), [appointments]);

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="mt-1 text-2xl font-bold text-[#1e293b]">Appointment History</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Completed, cancelled, and missed appointment records.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Completed', value: counts.completed, color: '#10B981' },
          { label: 'Cancelled', value: counts.cancelled, color: '#94a3b8' },
          { label: 'Missed', value: counts.missed, color: '#DC2626' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#334155]/10 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs font-medium text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-[#334155]/10 bg-white px-3 py-2 shadow-sm">
          <MdSearch size={16} className="text-[#94a3b8]" />
          <input type="text" placeholder="Search patient, type, location..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#94a3b8]" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[#334155]/10 bg-white p-1 shadow-sm">
          {['ALL', 'COMPLETED', 'CANCELLED', 'MISSED'].map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-[#2563EB] text-white' : 'text-[#64748b] hover:text-[#1e293b]'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#334155]/10 bg-white px-3 py-2 shadow-sm text-xs text-[#64748b]">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent outline-none text-[#334155]" />
          <span>–</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent outline-none text-[#334155]" />
        </div>
      </div>

      {error && <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}

      {!error && filtered.length === 0 && <EmptyState title="No history found" message="No historical appointments match the current filters." />}

      {!error && filtered.length > 0 && (
        <div className="rounded-xl border border-[#334155]/10 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="mobile-card-table appointment-history-table w-full text-left">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  {['Date/Time', 'Patient', 'Type', 'Location', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748b]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((appt) => {
                  const meta = STATUS_META[appt.status] || { color: '#94a3b8', label: appt.status };
                  return (
                    <tr key={appt.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                      <td className="px-4 py-3 text-sm text-[#334155]">{fmtDate(appt.scheduledAt)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">{appt.patientName || `Patient #${appt.patientId}`}</td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">{appt.appointmentType || '—'}</td>
                      <td className="px-4 py-3 text-sm text-[#94a3b8]">{appt.location || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: `${meta.color}15`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => navigate(`/dashboard/appointments/${appt.id}`)}
                          className="rounded-lg border border-[#334155]/15 px-2.5 py-1 text-xs font-medium text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                          More details
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}

export default AppointmentHistory;
