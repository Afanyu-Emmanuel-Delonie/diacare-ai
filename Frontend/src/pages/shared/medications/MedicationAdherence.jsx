import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { MdCheckCircle, MdCancel, MdMedication, MdArrowForward } from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  getMedications, getMedicationsByPatient, updateMedicationAdherence,
} from '../../../services/medicationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

// Build chart from real medication adherence statuses
function buildChartData(medications) {
  // Group by medication name, show actual status per medication
  return medications.slice(0, 10).map((m) => ({
    label: String(m.medicationName || '').slice(0, 12),
    taken: m.adherenceStatus === 'TAKEN' ? 1 : 0,
    missed: (m.adherenceStatus === 'MISSED' || m.missedMedicationAlert) ? 1 : 0,
    pending: (!m.adherenceStatus || m.adherenceStatus === 'PENDING') ? 1 : 0,
  }));
}

function AdherenceRow({ med, canMark, onMark }) {
  const [marking, setMarking] = useState(false);
  const status = med.adherenceStatus || 'PENDING';
  const taken = status === 'TAKEN';
  const missed = status === 'MISSED' || med.missedMedicationAlert;

  const mark = async (s) => {
    setMarking(true);
    await onMark(med, s);
    setMarking(false);
  };

  return (
    <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-3 last:border-0">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${taken ? 'bg-[#10B981]/10' : missed ? 'bg-[#DC2626]/10' : 'bg-[#F59E0B]/10'}`}>
        {taken ? <MdCheckCircle size={18} className="text-[#10B981]" />
          : missed ? <MdCancel size={18} className="text-[#DC2626]" />
            : <MdMedication size={18} className="text-[#F59E0B]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1e293b] truncate">{med.medicationName}</p>
        <p className="text-xs text-[#94a3b8]">
          {med.lastAdherenceUpdatedAt
            ? `Updated ${new Date(med.lastAdherenceUpdatedAt).toLocaleDateString()}`
            : 'Not yet updated'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${taken ? 'bg-[#10B981]/10 text-[#10B981]' : missed ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
          {taken ? 'Taken' : missed ? 'Missed' : 'Pending'}
        </span>
        {canMark && (
          <div className="flex gap-1">
            <button type="button" disabled={marking || taken} onClick={() => mark('TAKEN')}
              className="rounded-lg bg-[#10B981]/10 px-2.5 py-1 text-xs font-semibold text-[#10B981] hover:bg-[#10B981]/20 disabled:opacity-40 transition-colors">
              Taken
            </button>
            <button type="button" disabled={marking || missed} onClick={() => mark('MISSED')}
              className="rounded-lg bg-[#DC2626]/10 px-2.5 py-1 text-xs font-semibold text-[#DC2626] hover:bg-[#DC2626]/20 disabled:opacity-40 transition-colors">
              Missed
            </button>
          </div>
        )}
        <Link to={`/dashboard/medications/${med.id}`} className="text-[#cbd5e1] hover:text-[#2563EB] transition-colors">
          <MdArrowForward size={16} />
        </Link>
      </div>
    </div>
  );
}

function MedicationAdherence() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canMark = userRole === ROLES.PATIENT;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = patientId ? await getMedicationsByPatient(patientId) : await getMedications();
      setMedications(res.data || []);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to load medication adherence.');
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  const onMark = async (med, status) => {
    try {
      await updateMedicationAdherence(med.id, { adherenceStatus: status });
      showToast({ type: 'success', message: `Marked as ${status.toLowerCase()}.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', message: getApiErrorMessage(err, 'Failed to update adherence.') });
    }
  };

  const taken = useMemo(() => medications.filter((m) => m.adherenceStatus === 'TAKEN').length, [medications]);
  const missed = useMemo(() => medications.filter((m) => m.adherenceStatus === 'MISSED' || m.missedMedicationAlert).length, [medications]);
  const pending = useMemo(() => medications.filter((m) => !m.adherenceStatus || m.adherenceStatus === 'PENDING').length, [medications]);
  const rate = medications.length ? Math.round((taken / medications.length) * 100) : 0;

  const chartData = useMemo(() => buildChartData(medications), [medications]);

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b]">Medication Adherence</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Track and update your medication adherence status.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Adherence Rate', value: `${rate}%`, color: rate >= 80 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#DC2626' },
          { label: 'Taken', value: taken, color: '#10B981' },
          { label: 'Missed', value: missed, color: '#DC2626' },
          { label: 'Pending', value: pending, color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#334155]/10 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs font-medium text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {medications.length > 0 && (
        <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1e293b]">Weekly Adherence Overview</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={14}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="taken" name="Taken" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="missed" name="Missed" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#FDE68A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {error && <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}

      {!error && medications.length === 0 && (
        <EmptyState title="No medication records" message="No medication adherence records are available." />
      )}

      {!error && medications.length > 0 && (
        <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1e293b]">All Medications</h2>
          <div>
            {medications.map((med) => (
              <AdherenceRow key={med.id} med={med} canMark={canMark} onMark={onMark} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicationAdherence;
