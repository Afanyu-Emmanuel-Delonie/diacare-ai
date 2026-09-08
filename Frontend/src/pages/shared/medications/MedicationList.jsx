import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdAdd, MdSearch, MdMedication, MdCheckCircle, MdCancel,
  MdWarning, MdChevronLeft, MdChevronRight, MdInfoOutline, MdEdit,
} from 'react-icons/md';
import ActionsMenu from '../../../components/common/ActionsMenu.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  filterMedications, getMedicationStatus, getMedications,
  getMedicationsByPatient, updateMedicationAdherence,
} from '../../../services/medicationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

const PAGE_SIZE = 10;

function adherenceColor(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'TAKEN') return { bg: '#10B981', text: 'Taken' };
  if (s === 'MISSED') return { bg: '#DC2626', text: 'Missed' };
  return { bg: '#F59E0B', text: 'Pending' };
}

function statusColor(status) {
  return status === 'ACTIVE' ? '#10B981' : '#94a3b8';
}

// ── Stat card ─────────────────────────────────────────────────────────────────
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

// ── Med row ───────────────────────────────────────────────────────────────────
function MedRow({ med, canEdit, canMarkAdherence, onMark, navigate }) {
  const adh = adherenceColor(med.adherenceStatus);
  const st = getMedicationStatus(med);

  const mark = (status) => onMark(med, status);

  return (
    <tr className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10">
            <MdMedication size={16} className="text-[#2563EB]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1e293b]">{med.medicationName}</p>
            <p className="text-xs text-[#94a3b8]">{med.medicationClass || '—'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#334155]">{med.patientName || `Patient #${med.patientId}`}</td>
      <td className="px-4 py-3 text-sm text-[#334155]">
        {med.doctorPrescribedDose || '—'}
        <span className="block text-xs text-[#94a3b8]">{med.medicationSchedule || med.typicalTiming || 'No schedule set'}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${adh.bg}18`, color: adh.bg }}>
            {adh.text}
          </span>
          {med.missedMedicationAlert && (
            <span className="flex items-center gap-1 text-xs font-semibold text-[#DC2626]" title="Missed medication alert">
              <MdWarning size={13} />
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${statusColor(st)}18`, color: statusColor(st) }}>
          {st}
        </span>
      </td>
      <td className="px-4 py-3">
        <ActionsMenu items={[
          { key: 'details', label: 'More details', icon: MdInfoOutline, onClick: () => navigate(`/dashboard/medications/${med.id}`) },
          canEdit && { key: 'edit', label: 'Edit', icon: MdEdit, onClick: () => navigate(`/dashboard/medications/${med.id}/edit`) },
          canMarkAdherence && { key: 'taken', label: 'Mark taken', icon: MdCheckCircle, onClick: () => mark('TAKEN') },
          canMarkAdherence && { key: 'missed', label: 'Mark missed', icon: MdCancel, variant: 'danger', onClick: () => mark('MISSED') },
        ]} />
      </td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function MedicationList() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  const canCreate = userRole === ROLES.DOCTOR;
  const canEdit = userRole === ROLES.DOCTOR;
  const canMarkAdherence = userRole === ROLES.PATIENT;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = patientId ? await getMedicationsByPatient(patientId) : await getMedications();
      setMedications(res.data || []);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load medications.');
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  const filtered = useMemo(() =>
    filterMedications(medications, { search, patient: 'ALL', medicationName: 'ALL', status: statusFilter, dateFrom: '', dateTo: '' }),
    [medications, search, statusFilter]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => setPage(0), [search, statusFilter]);

  const markAdherence = async (med, status) => {
    try {
      await updateMedicationAdherence(med.id, { adherenceStatus: status });
      showToast({ type: 'success', message: `Marked as ${status.toLowerCase()}.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', message: getApiErrorMessage(err, 'Failed to update adherence.') });
    }
  };

  const active = medications.filter((m) => getMedicationStatus(m) === 'ACTIVE').length;
  const missed = medications.filter((m) => m.missedMedicationAlert).length;
  const taken = medications.filter((m) => m.adherenceStatus === 'TAKEN').length;

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Medication Management</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">Prescribed medications, schedules, and adherence tracking.</p>
        </div>
        {canCreate && (
          <Link to={patientId ? `/dashboard/medications/new?patientId=${patientId}` : '/dashboard/medications/new'}>
            <button type="button" className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors">
              <MdAdd size={16} /> Add Medication
            </button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={medications.length} color="#2563EB" icon={MdMedication} />
        <StatCard label="Active" value={active} color="#10B981" icon={MdCheckCircle} />
        <StatCard label="Taken Today" value={taken} color="#0ea5e9" icon={MdCheckCircle} />
        <StatCard label="Missed Alerts" value={missed} color="#DC2626" icon={MdWarning} />
      </div>

      {/* Safety note */}
      <div className="rounded-xl border border-[#F59E0B]/30 bg-[#FEF3C7] px-4 py-3 text-xs text-[#92400e]">
        Medications shown are prescribed by your care team. Do not change dosage or stop taking medications without consulting your doctor.
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-[#334155]/10 bg-white px-3 py-2">
          <MdSearch size={16} className="text-[#94a3b8]" />
          <input
            type="text" placeholder="Search medications..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#94a3b8]"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[#334155]/10 bg-white p-1">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((s) => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-[#2563EB] text-white' : 'text-[#64748b] hover:text-[#1e293b]'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}

      {!error && filtered.length === 0 && (
        <EmptyState title="No medications found" message="No medications match the current filters." />
      )}

      {!error && filtered.length > 0 && (
        <div className="rounded-xl border border-[#334155]/10 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="mobile-card-table medication-table w-full text-left">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  {['Medication', 'Patient', 'Dose & Schedule', 'Adherence', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748b]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((med) => (
                  <MedRow key={med.id} med={med} canEdit={canEdit} canMarkAdherence={canMarkAdherence}
                    onMark={markAdherence} navigate={navigate} />
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#f1f5f9] px-5 py-3">
              <span className="text-xs text-[#94a3b8]">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
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

export default MedicationList;
