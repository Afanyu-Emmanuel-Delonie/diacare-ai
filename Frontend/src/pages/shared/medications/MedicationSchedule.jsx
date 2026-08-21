import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MdMedication, MdCheckCircle, MdSchedule, MdArrowForward } from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useToast from '../../../hooks/useToast.js';
import { getMedicationStatus, getMedications, getMedicationsByPatient } from '../../../services/medicationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', range: '6 AM – 12 PM', color: '#F59E0B' },
  { key: 'afternoon', label: 'Afternoon', range: '12 PM – 6 PM', color: '#2563EB' },
  { key: 'evening', label: 'Evening', range: '6 PM – 10 PM', color: '#8b5cf6' },
  { key: 'night', label: 'Night', range: '10 PM – 6 AM', color: '#1e3a5f' },
  { key: 'other', label: 'Other / As Needed', range: '', color: '#94a3b8' },
];

function classifyTiming(med) {
  const t = String(med.typicalTiming || med.medicationSchedule || '').toLowerCase();
  if (t.includes('morning') || t.includes('breakfast') || t.includes('am')) return 'morning';
  if (t.includes('afternoon') || t.includes('lunch') || t.includes('noon')) return 'afternoon';
  if (t.includes('evening') || t.includes('dinner') || t.includes('pm')) return 'evening';
  if (t.includes('night') || t.includes('bed') || t.includes('sleep')) return 'night';
  return 'other';
}

function MedCard({ med }) {
  const taken = med.adherenceStatus === 'TAKEN';
  const missed = med.adherenceStatus === 'MISSED' || med.missedMedicationAlert;

  return (
    <Link to={`/dashboard/medications/${med.id}`}
      className="group flex items-start gap-3 rounded-xl border border-[#334155]/10 bg-white p-4 shadow-sm hover:border-[#2563EB]/30 hover:shadow-md transition-all">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${taken ? 'bg-[#10B981]/10' : missed ? 'bg-[#DC2626]/10' : 'bg-[#2563EB]/10'}`}>
        {taken
          ? <MdCheckCircle size={18} className="text-[#10B981]" />
          : missed
            ? <MdSchedule size={18} className="text-[#DC2626]" />
            : <MdMedication size={18} className="text-[#2563EB]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1e293b] truncate">{med.medicationName}</p>
        <p className="text-xs text-[#94a3b8]">{med.doctorPrescribedDose || '—'}</p>
        {med.typicalTiming && <p className="mt-0.5 text-xs text-[#64748b]">{med.typicalTiming}</p>}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${taken ? 'bg-[#10B981]/10 text-[#10B981]' : missed ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
          {taken ? 'Taken' : missed ? 'Missed' : 'Pending'}
        </span>
        <MdArrowForward size={13} className="text-[#cbd5e1] group-hover:text-[#2563EB] transition-colors" />
      </div>
    </Link>
  );
}

function MedicationSchedule() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { showToast } = useToast();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const req = patientId ? getMedicationsByPatient(patientId) : getMedications();
    req
      .then((res) => setMedications(res.data || []))
      .catch((err) => {
        const msg = getApiErrorMessage(err, 'Failed to load medication schedule.');
        setError(msg);
        showToast({ type: 'error', message: msg });
      })
      .finally(() => setLoading(false));
  }, [patientId, showToast]);

  const active = useMemo(() => medications.filter((m) => getMedicationStatus(m) === 'ACTIVE'), [medications]);

  const grouped = useMemo(() => {
    const map = {};
    for (const slot of TIME_SLOTS) map[slot.key] = [];
    for (const med of active) map[classifyTiming(med)].push(med);
    return map;
  }, [active]);

  const taken = active.filter((m) => m.adherenceStatus === 'TAKEN').length;
  const pending = active.filter((m) => m.adherenceStatus !== 'TAKEN').length;

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b]">Medication Schedule</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Today's prescribed medication schedule from your care team.</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: active.length, color: '#2563EB' },
          { label: 'Taken', value: taken, color: '#10B981' },
          { label: 'Pending', value: pending, color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#334155]/10 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs font-medium text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Safety note */}
      <div className="rounded-xl border border-[#F59E0B]/30 bg-[#FEF3C7] px-4 py-3 text-xs text-[#92400e]">
        Do not change dosage or stop taking medications without consulting your doctor.
      </div>

      {error && <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}

      {!error && active.length === 0 && (
        <EmptyState title="No active medications" message="No active medication schedules are available." />
      )}

      {/* Time slots */}
      {!error && active.length > 0 && TIME_SLOTS.map((slot) => {
        const meds = grouped[slot.key];
        if (!meds.length) return null;
        return (
          <div key={slot.key}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ background: slot.color }} />
                <span className="text-sm font-bold text-[#1e293b]">{slot.label}</span>
                {slot.range && <span className="text-xs text-[#94a3b8]">{slot.range}</span>}
              </div>
              <div className="flex-1 border-t border-[#e2e8f0]" />
              <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold text-[#94a3b8]">{meds.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {meds.map((med) => <MedCard key={med.id} med={med} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MedicationSchedule;
