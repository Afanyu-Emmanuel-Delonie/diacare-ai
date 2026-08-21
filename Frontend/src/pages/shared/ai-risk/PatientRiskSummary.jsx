import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import {
  MdArrowBack, MdPsychology, MdWarning, MdCheckCircle,
  MdBloodtype, MdScience, MdArrowForward,
} from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import PatientSelect from '../../../components/common/PatientSelect.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { filterRiskPredictions, getRiskPredictions, safeRiskText } from '../../../services/riskPredictionService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import RiskLevelBadge from './RiskLevelBadge.jsx';
import RiskSafetyNotice from './RiskSafetyNotice.jsx';
import { buildRiskTrend, formatDateTime, noData } from './riskPageUtils.js';

const RISK_COLOR = {
  LOW_RISK: '#10B981',
  MODERATE_RISK: '#F59E0B',
  HIGH_RISK: '#DC2626',
  EMERGENCY_RISK: '#7f1d1d',
};

const RISK_SCORE = { LOW_RISK: 25, MODERATE_RISK: 50, HIGH_RISK: 75, EMERGENCY_RISK: 100 };

function RiskGauge({ level }) {
  const color = RISK_COLOR[level] || '#94a3b8';
  const score = RISK_SCORE[level] || 25;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%"
            startAngle={210} endAngle={-30} data={[{ value: score, fill: color }]} barSize={14}>
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-[#94a3b8]">/ 100</span>
        </div>
      </div>
      <RiskLevelBadge level={level} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#334155]/10 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium text-[#64748b]">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-[#1e293b]">{value}</p>
        {sub && <p className="text-xs text-[#94a3b8]">{sub}</p>}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#64748b]">{label}</p>
      <p className="mt-0.5 text-sm text-[#334155]">{noData(value)}</p>
    </div>
  );
}

function PatientRiskSummary() {
  const [searchParams] = useSearchParams();
  const { userRole, user } = useAuth();
  const { showToast } = useToast();
  const isPatient = userRole === ROLES.PATIENT;

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientFilter, setPatientFilter] = useState(
    isPatient ? String(user?.id || '') : (searchParams.get('patientId') || '')
  );

  useEffect(() => {
    getRiskPredictions()
      .then((res) => setPredictions(res.data || []))
      .catch((err) => showToast({ type: 'error', message: getApiErrorMessage(err, 'Unable to load patient risk summary.') }))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = useMemo(() => filterRiskPredictions(predictions, { patient: patientFilter }), [predictions, patientFilter]);
  const latest = filtered[0];
  const trendData = useMemo(() => buildRiskTrend(filtered), [filtered]);

  const stats = useMemo(() => ({
    total: filtered.length,
    high: filtered.filter((p) => p.riskLevel === 'HIGH_RISK' || p.riskLevel === 'EMERGENCY_RISK').length,
    pending: filtered.filter((p) => p.doctorReviewStatus !== 'REVIEWED').length,
    abnormal: latest?.repeatedAbnormalReadings ?? 0,
  }), [filtered, latest]);

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-5">
      <RiskSafetyNotice />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/dashboard/ai-risk" className="mb-2 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
            <MdArrowBack size={13} /> Risk Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#1e293b]">Patient Risk Summary</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">Patient-level risk summary, safe guidance, and doctor review status.</p>
        </div>
        {!isPatient && (
          <div className="w-full max-w-xs">
            <PatientSelect
              name="patientFilter"
              label="Filter by patient"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
            />
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No risk records" message="No AI-supported risk records match the selected patient." />
      )}

      {latest && (
        <>
          {/* Stat cards */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Records" value={stats.total} color="#2563EB" icon={MdPsychology} />
            <StatCard label="High / Emergency" value={stats.high} color="#DC2626" icon={MdWarning} sub="Requires attention" />
            <StatCard label="Pending Review" value={stats.pending} color="#8b5cf6" icon={MdCheckCircle} sub="Not yet reviewed" />
            <StatCard label="Repeated Abnormal" value={stats.abnormal} color="#F59E0B" icon={MdWarning} sub="Abnormal readings" />
          </div>

          {/* Gauge + vitals */}
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="flex items-center justify-center rounded-xl border border-[#334155]/10 bg-white p-6 shadow-sm">
              <RiskGauge level={latest.riskLevel} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Blood Glucose', value: `${noData(latest.bloodGlucoseValue)} mg/dL`, icon: MdBloodtype, color: '#DC2626' },
                { label: 'HbA1c', value: `${noData(latest.hba1cValue)} %`, icon: MdScience, color: '#8b5cf6' },
                { label: 'Doctor Review', value: latest.doctorReviewStatus, icon: MdCheckCircle, color: '#10B981' },
                { label: 'Repeated Abnormal', value: latest.repeatedAbnormalReadings ?? 0, icon: MdWarning, color: '#F59E0B' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-[#334155]/10 bg-white p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#64748b]">{label}</p>
                    <p className="mt-0.5 text-lg font-bold text-[#1e293b]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend chart */}
          {trendData.length > 1 && (
            <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-[#1e293b]">
                Risk Trend <span className="font-normal text-[#94a3b8]">(1=Low · 2=Moderate · 3=High · 4=Emergency)</span>
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskSumGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [['Low', 'Moderate', 'High', 'Emergency'][v - 1] || v, 'Risk']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fill="url(#riskSumGrad)"
                      dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detail card */}
          <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-[#1e293b]">{latest.patientName}</p>
                <p className="text-xs text-[#94a3b8]">{formatDateTime(latest.predictionDateTime)}</p>
              </div>
              <RiskLevelBadge level={latest.riskLevel} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <DetailItem label="Risk Type" value={latest.riskType} />
              <DetailItem label="Medication Adherence Risk" value={latest.medicationAdherenceRisk} />
              <DetailItem label="AI Explanation" value={safeRiskText(latest.aiExplanation)} />
              <DetailItem label="Recommended Action" value={safeRiskText(latest.recommendedActionText)} />
              <DetailItem
                label="Doctor Review"
                value={userRole === ROLES.CAREGIVER ? 'Limited by caregiver permissions.' : latest.doctorComment}
              />
            </div>
            <Link
              to="/dashboard/ai-risk/history"
              className="mt-5 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
            >
              View full history <MdArrowForward size={13} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientRiskSummary;
