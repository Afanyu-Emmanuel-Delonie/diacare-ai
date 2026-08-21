import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdEmergency, MdArrowBack, MdPhone } from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { filterRiskPredictions, getRiskPredictions, safeRiskText } from '../../../services/riskPredictionService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import RiskLevelBadge from './RiskLevelBadge.jsx';
import RiskSafetyNotice from './RiskSafetyNotice.jsx';
import { formatDateTime, noData } from './riskPageUtils.js';

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#64748b]">{label}</p>
      <p className="mt-0.5 text-sm text-[#334155]">{noData(value)}</p>
    </div>
  );
}

function EmergencyCard({ prediction, userRole }) {
  return (
    <div className="rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DC2626]/10">
            <MdEmergency size={20} className="text-[#DC2626]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1e293b]">{prediction.patientName}</p>
            <p className="text-xs text-[#94a3b8]">{formatDateTime(prediction.predictionDateTime)}</p>
          </div>
        </div>
        <RiskLevelBadge level={prediction.riskLevel} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Detail label="Risk Type" value={prediction.riskType} />
        <Detail label="Blood Glucose" value={prediction.bloodGlucoseValue ? `${prediction.bloodGlucoseValue} mg/dL` : null} />
        <Detail label="HbA1c" value={prediction.hba1cValue ? `${prediction.hba1cValue}%` : null} />
        <Detail label="Repeated Abnormal Readings" value={prediction.repeatedAbnormalReadings} />
        <Detail label="AI Explanation" value={safeRiskText(prediction.aiExplanation)} />
        <Detail label="Recommended Action" value={safeRiskText(prediction.recommendedActionText)} />
        <Detail label="Doctor Review Status" value={prediction.doctorReviewStatus} />
        <Detail label="Doctor Comment" value={userRole === ROLES.CAREGIVER ? 'Limited by caregiver permissions.' : prediction.doctorComment} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-xl bg-[#DC2626]/10 px-3 py-1.5 text-xs font-bold text-[#DC2626]">
          <MdEmergency size={13} /> Emergency level risk
        </span>
        <span className="flex items-center gap-1.5 rounded-xl border border-[#334155]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#334155]">
          <MdPhone size={13} /> Follow provider emergency plan
        </span>
      </div>
    </div>
  );
}

function EmergencyRiskView() {
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiskPredictions()
      .then((res) => setPredictions(res.data || []))
      .catch((err) => showToast({ type: 'error', message: getApiErrorMessage(err, 'Unable to load emergency risk view.') }))
      .finally(() => setLoading(false));
  }, [showToast]);

  const emergency = useMemo(() =>
    filterRiskPredictions(predictions, { riskLevel: 'EMERGENCY_RISK' }),
    [predictions]
  );

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-5">
      <RiskSafetyNotice />

      <div>
        <Link to="/dashboard/ai-risk" className="mb-2 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
          <MdArrowBack size={13} /> Risk Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#1e293b]">Emergency Risk View</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Emergency-level AI-supported risk records requiring urgent attention.</p>
      </div>

      {/* Urgent banner */}
      <div className="flex items-start gap-3 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] px-4 py-3">
        <MdEmergency size={20} className="text-[#DC2626] shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-[#DC2626]">
          Emergency-level risk may require urgent medical attention. Follow your healthcare provider's emergency plan or contact emergency services when symptoms are present.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#DC2626]/10 px-3 py-1 text-xs font-bold text-[#DC2626]">
          {emergency.length} emergency record{emergency.length !== 1 ? 's' : ''}
        </span>
      </div>

      {emergency.length === 0 && (
        <EmptyState title="No emergency risk records" message="No emergency-level risk records are currently available." />
      )}

      {emergency.length > 0 && (
        <div className="space-y-4">
          {emergency.map((p) => <EmergencyCard key={p.id} prediction={p} userRole={userRole} />)}
        </div>
      )}
    </div>
  );
}

export default EmergencyRiskView;
