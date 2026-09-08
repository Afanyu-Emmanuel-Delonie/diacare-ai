import { useEffect, useMemo, useState } from 'react';
import { MdWarning, MdSearch, MdArrowBack } from 'react-icons/md';
import { Link } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  filterRiskPredictions, getRiskPredictions,
  isAbnormalReading, safeRiskText,
} from '../../../services/riskPredictionService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import RiskLevelBadge from './RiskLevelBadge.jsx';
import RiskSafetyNotice from './RiskSafetyNotice.jsx';
import { formatDateTime } from './riskPageUtils.js';

const RISK_COLOR = { LOW_RISK: '#10B981', MODERATE_RISK: '#F59E0B', HIGH_RISK: '#DC2626', EMERGENCY_RISK: '#7f1d1d' };

function AlertCard({ prediction }) {
  const color = RISK_COLOR[prediction.riskLevel] || '#F59E0B';
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: `${color}30`, background: `${color}08` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
            <MdWarning size={18} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1e293b]">{prediction.patientName}</p>
            <p className="text-xs text-[#94a3b8]">{formatDateTime(prediction.predictionDateTime)}</p>
          </div>
        </div>
        <RiskLevelBadge level={prediction.riskLevel} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-[#64748b]">Glucose</p>
          <p className="text-sm font-bold" style={{ color: isAbnormalReading(prediction.bloodGlucoseValue) ? '#DC2626' : '#1e293b' }}>
            {prediction.bloodGlucoseValue || '—'} mg/dL
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#64748b]">Repeated Abnormal</p>
          <p className="text-sm font-bold text-[#1e293b]">{prediction.repeatedAbnormalReadings ?? 0}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-[#64748b]">Guidance</p>
          <p className="text-sm text-[#475569]">{safeRiskText(prediction.aiExplanation)}</p>
        </div>
      </div>
    </div>
  );
}

function AbnormalReadingAlerts() {
  const { showToast } = useToast();
  const { userRole } = useAuth();
  const isPatient = userRole === ROLES.PATIENT;
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getRiskPredictions()
      .then((res) => setPredictions(res.data || []))
      .catch((err) => showToast({ type: 'error', message: getApiErrorMessage(err, 'Unable to load abnormal alerts.') }))
      .finally(() => setLoading(false));
  }, [showToast]);

  const alerts = useMemo(() => {
    return filterRiskPredictions(predictions, { search }).filter((p) => {
      const signals = p.triggeredSignals.join(' ').toLowerCase();
      return isAbnormalReading(p.bloodGlucoseValue) || p.repeatedAbnormalReadings > 0 ||
        signals.includes('abnormal') || signals.includes('hypo') || signals.includes('hyper');
    });
  }, [predictions, search]);

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-5">
      <RiskSafetyNotice />

      <div>
        <Link to="/dashboard/ai-risk" className="mb-2 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
          <MdArrowBack size={13} /> Risk Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#1e293b]">Abnormal Reading Alerts</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Risk records with abnormal glucose values or repeated abnormal readings.</p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-[#F59E0B]/30 bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400e]">
        <MdWarning size={18} className="text-[#F59E0B] shrink-0" />
        {isPatient
          ? "Your reading appears outside the expected range. Please follow your healthcare provider's advice."
          : 'Review each abnormal reading below and follow up with the patient as needed.'}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[#334155]/10 bg-white px-3 py-2">
        <MdSearch size={16} className="text-[#94a3b8]" />
        <input type="text" placeholder="Search patient or explanation..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#94a3b8]" />
      </div>

      {alerts.length === 0 && <EmptyState title="No abnormal alerts" message="No abnormal reading alerts match the current filters." />}

      {alerts.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {alerts.map((p) => <AlertCard key={p.id} prediction={p} />)}
        </div>
      )}
    </div>
  );
}

export default AbnormalReadingAlerts;
