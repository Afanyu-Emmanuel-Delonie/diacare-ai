import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MdWarning, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useToast from '../../../hooks/useToast.js';
import {
  getMedications, getMedicationsByPatient, isMissedMedication,
  updateMedicationAdherence,
} from '../../../services/medicationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import useAuth from '../../../hooks/useAuth.js';

function fmtDate(val) {
  return val ? new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

function AlertCard({ med, canMark, onMark }) {
  const [marking, setMarking] = useState(false);

  const mark = async () => {
    setMarking(true);
    await onMark(med, 'TAKEN');
    setMarking(false);
  };

  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DC2626]/10">
        <MdWarning size={20} className="text-[#DC2626]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1e293b]">{med.medicationName}</p>
        <p className="text-xs text-[#64748b]">{med.patientName || `Patient #${med.patientId}`}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#64748b]">
          <span>Dose: <strong className="text-[#334155]">{med.doctorPrescribedDose || '—'}</strong></span>
          <span>Reminder: <strong className="text-[#334155]">{med.reminderSchedule || 'Not set'}</strong></span>
          <span>Last updated: <strong className="text-[#334155]">{fmtDate(med.lastAdherenceUpdatedAt)}</strong></span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="rounded-full bg-[#DC2626]/10 px-2.5 py-0.5 text-xs font-bold text-[#DC2626]">Missed</span>
        <div className="flex gap-1.5">
          {canMark && (
            <button type="button" disabled={marking} onClick={mark}
              className="flex items-center gap-1 rounded-lg bg-[#10B981]/10 px-2.5 py-1 text-xs font-semibold text-[#10B981] hover:bg-[#10B981]/20 disabled:opacity-50 transition-colors">
              <MdCheckCircle size={12} /> Mark Taken
            </button>
          )}
          <Link to={`/dashboard/medications/${med.id}`}
            className="flex items-center gap-1 rounded-lg border border-[#334155]/15 px-2.5 py-1 text-xs font-medium text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
            View <MdArrowForward size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MissedMedicationAlerts() {
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
      const msg = getApiErrorMessage(err, 'Failed to load missed medication alerts.');
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  const missed = useMemo(() => medications.filter(isMissedMedication), [medications]);

  const onMark = async (med, status) => {
    try {
      await updateMedicationAdherence(med.id, { adherenceStatus: status });
      showToast({ type: 'success', message: 'Medication marked as taken.' });
      await load();
    } catch (err) {
      showToast({ type: 'error', message: getApiErrorMessage(err, 'Failed to update adherence.') });
    }
  };

  if (loading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b]">Missed Medication Alerts</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Medications flagged as missed or overdue.</p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3">
        <MdWarning size={20} className="text-[#DC2626]" />
        <p className="text-sm font-semibold text-[#DC2626]">
          {missed.length} missed medication{missed.length !== 1 ? 's' : ''} require attention.
        </p>
      </div>

      {error && <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}

      {!error && missed.length === 0 && (
        <EmptyState title="No missed medication alerts" message="All medications are up to date." />
      )}

      {!error && missed.length > 0 && (
        <div className="space-y-3">
          {missed.map((med) => (
            <AlertCard key={med.id} med={med} canMark={canMark} onMark={onMark} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MissedMedicationAlerts;
