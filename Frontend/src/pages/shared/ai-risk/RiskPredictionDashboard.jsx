import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import {
  MdPsychology, MdWarning, MdHistory, MdEmergency,
  MdArrowForward, MdCheckCircle,
} from 'react-icons/md';
import Input from '../../../components/common/Input.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  countAbnormalReadings, getRiskPredictions, parseRecentReadings,
  predictRisk, safeGuidanceExamples, safeRiskText,
  saveGeneratedRiskPrediction,
} from '../../../services/riskPredictionService.js';
import { getPatients, getPatientDisplayName } from '../../../services/patientService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import RiskLevelBadge from './RiskLevelBadge.jsx';
import RiskSafetyNotice from './RiskSafetyNotice.jsx';
import { buildRiskTrend, formatDateTime } from './riskPageUtils.js';

const RISK_COLOR = { LOW_RISK: '#10B981', MODERATE_RISK: '#F59E0B', HIGH_RISK: '#DC2626', EMERGENCY_RISK: '#7f1d1d' };

function riskColor(level) { return RISK_COLOR[level] || '#94a3b8'; }

function StatCard({ label, value, color, icon: Icon, sub }) {
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

function RiskGauge({ level }) {
  const color = riskColor(level);
  const score = { LOW_RISK: 25, MODERATE_RISK: 50, HIGH_RISK: 75, EMERGENCY_RISK: 100 }[level] || 25;
  return (
    <div className="flex flex-col items-center">
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
      <span className="mt-1 rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${color}18`, color }}>
        {String(level || 'LOW_RISK').replace('_', ' ')}
      </span>
    </div>
  );
}

const initialForm = {
  patientId: '', currentReading: '',
  measuredAt: new Date().toISOString().slice(0, 16),
  recentReadings: '', medicationAdherenceMissed: false, hba1cResult: '',
};

function RiskPredictionDashboard() {
  const { showToast } = useToast();
  const { userRole, user } = useAuth();
  const isPatient = userRole === ROLES.PATIENT;
  const [form, setForm] = useState({ ...initialForm, patientId: isPatient ? String(user?.id || '') : '' });
  const [predictions, setPredictions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.allSettled([getRiskPredictions(), getPatients()]);
      if (rRes.status === 'fulfilled') setPredictions(rRes.value.data || []);
      if (pRes.status === 'fulfilled') setPatients(pRes.value.data || []);
    } catch (err) {
      showToast({ type: 'error', message: getApiErrorMessage(err, 'Unable to load risk predictions.') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = useMemo(() => ({
    total: predictions.length,
    emergency: predictions.filter((p) => p.riskLevel === 'EMERGENCY_RISK').length,
    high: predictions.filter((p) => p.riskLevel === 'HIGH_RISK').length,
    pending: predictions.filter((p) => p.doctorReviewStatus !== 'REVIEWED').length,
  }), [predictions]);

  const trendData = useMemo(() => buildRiskTrend(predictions), [predictions]);

  const updateField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        currentReading: Number(form.currentReading),
        measuredAt: form.measuredAt,
        recentReadings: parseRecentReadings(form.recentReadings),
        medicationAdherenceMissed: form.medicationAdherenceMissed,
        hba1cResult: form.hba1cResult ? Number(form.hba1cResult) : null,
      };
      // Resolve patient name from loaded patients list
      const selectedPatient = patients.find((p) => String(p.id) === String(form.patientId));
      const patientName = selectedPatient ? getPatientDisplayName(selectedPatient) : '';
      const res = await predictRisk(payload);
      const prediction = saveGeneratedRiskPrediction(res.data, { ...payload, patientId: form.patientId, patientName });
      setLatest(prediction);
      await load();
      showToast({ type: 'success', message: 'AI-supported risk result generated.' });
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to generate risk result.');
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const abnormalCount = countAbnormalReadings(parseRecentReadings(form.recentReadings));

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-5">
      <RiskSafetyNotice />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Risk Prediction Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">AI-supported monitoring results, safe guidance, and doctor review status.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/ai-risk/history">
            <button type="button" className="flex items-center gap-2 rounded-xl border border-[#334155]/15 bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-sm hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
              <MdHistory size={16} /> History
            </button>
          </Link>
          <Link to="/dashboard/ai-risk/emergency">
            <button type="button" className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#b91c1c] transition-colors">
              <MdEmergency size={16} /> Emergency
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Records" value={summary.total} color="#2563EB" icon={MdPsychology} />
        <StatCard label="Emergency Risk" value={summary.emergency} color="#DC2626" icon={MdEmergency} sub="Requires urgent attention" />
        <StatCard label="High Risk" value={summary.high} color="#F59E0B" icon={MdWarning} sub="Review with provider" />
        <StatCard label="Pending Review" value={summary.pending} color="#8b5cf6" icon={MdCheckCircle} sub="Not yet reviewed" />
      </div>

      {/* Trend chart */}
      {trendData.length > 0 && (
        <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1e293b]">Risk Trend (1=Low, 2=Moderate, 3=High, 4=Emergency)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [['Low', 'Moderate', 'High', 'Emergency'][v - 1] || v, 'Risk']} />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fill="url(#riskGrad)"
                  dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#1e293b]">Generate AI-supported Risk Result</h2>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          {!isPatient && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#334155]">Patient</label>
              <select
                name="patientId"
                value={form.patientId}
                onChange={updateField}
                className="min-h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{getPatientDisplayName(p)}</option>
                ))}
              </select>
            </div>
          )}
          <Input id="currentReading" name="currentReading" label="Blood glucose (mg/dL)" type="number" min="40" max="500" value={form.currentReading} onChange={updateField} required />
          <Input id="measuredAt" name="measuredAt" label="Date and time" type="datetime-local" value={form.measuredAt} onChange={updateField} required />
          <Input id="recentReadings" name="recentReadings" label="Recent readings, comma separated" value={form.recentReadings} onChange={updateField} placeholder="e.g. 120, 185, 192" />
          <Input id="hba1cResult" name="hba1cResult" label="HbA1c (%)" type="number" min="3" max="20" step="0.1" value={form.hba1cResult} onChange={updateField} />
          <label className="flex items-center gap-3 rounded-xl border border-[#334155]/15 px-4 py-3 text-sm font-medium text-[#334155] cursor-pointer hover:border-[#2563EB]/40 transition-colors">
            <input type="checkbox" name="medicationAdherenceMissed" checked={form.medicationAdherenceMissed} onChange={updateField} className="h-4 w-4 rounded" />
            Medication adherence risk
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60 transition-colors">
              {submitting ? 'Generating...' : 'Generate Risk Summary'}
            </button>
          </div>
        </form>
        {abnormalCount > 0 && (
          <p className="mt-3 text-xs text-[#F59E0B]">{abnormalCount} abnormal reading{abnormalCount !== 1 ? 's' : ''} detected in input.</p>
        )}
        {error && <div className="mt-3 rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>}
      </div>

      {/* Latest result */}
      {latest ? (
        <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#1e293b]">Latest Risk Summary</h2>
              <p className="text-xs text-[#94a3b8]">Generated {formatDateTime(latest.predictionDateTime)}</p>
            </div>
            <div className="flex items-center gap-3">
              <RiskGauge level={latest.riskLevel} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[
              ['Patient', latest.patientName],
              ['Risk Type', latest.riskType],
              ['AI Explanation', safeRiskText(latest.aiExplanation)],
              ['Recommended Action', safeRiskText(latest.recommendedActionText)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-[#64748b]">{label}</p>
                <p className="mt-0.5 text-sm text-[#334155]">{value || '—'}</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard/ai-risk/history" className="mt-4 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
            View full history <MdArrowForward size={13} />
          </Link>
        </div>
      ) : (
        <EmptyState title="No result yet" message="Use the form above to generate an AI-supported risk result." />
      )}

      {/* Guidance note */}
      <div className="rounded-xl border border-[#2563EB]/20 bg-[#EFF6FF] px-4 py-3 text-xs text-[#1e40af]">
        {safeGuidanceExamples.join(' ')}
      </div>
    </div>
  );
}

export default RiskPredictionDashboard;
