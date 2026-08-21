import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, RadialBarChart, RadialBar,
  BarChart, Bar, Legend,
} from 'recharts';
import {
  MdMonitorHeart, MdMedication, MdCalendarMonth, MdPsychology,
  MdTrendingUp, MdTrendingDown, MdRemove, MdArrowForward,
  MdCheckCircle, MdSchedule, MdWarning, MdFavorite,
} from 'react-icons/md';
import EmptyState from '../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../hooks/useAuth.js';
import useToast from '../../hooks/useToast.js';
import { getGlucoseReadings } from '../../services/healthMonitoringService.js';
import { getMedications } from '../../services/medicationService.js';
import { getAppointments, isUpcomingAppointment } from '../../services/appointmentService.js';
import { getRiskPredictions } from '../../services/riskPredictionService.js';
import { getLabResults } from '../../services/healthMonitoringService.js';
import { getApiErrorMessage } from '../../utils/apiErrors.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
function glucoseStatus(val) {
  const n = Number(val);
  if (!n) return { label: 'No data', color: '#94a3b8' };
  if (n < 70) return { label: 'Low', color: '#DC2626' };
  if (n <= 140) return { label: 'Normal', color: '#10B981' };
  if (n <= 180) return { label: 'Elevated', color: '#F59E0B' };
  return { label: 'High', color: '#DC2626' };
}

function riskColor(level) {
  const l = String(level || '').toUpperCase();
  if (l.includes('EMERGENCY')) return '#DC2626';
  if (l.includes('HIGH')) return '#DC2626';
  if (l.includes('MODERATE')) return '#F59E0B';
  return '#10B981';
}

function riskLabel(level) {
  return String(level || 'LOW_RISK').replace('_RISK', '').replace('_', ' ');
}

function shortDay(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' });
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Build last-7-days glucose chart data from readings
function buildGlucoseChart(readings) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayReadings = readings.filter((r) => String(r.measuredAt || '').slice(0, 10) === key);
    const avg = dayReadings.length
      ? Math.round(dayReadings.reduce((s, r) => s + Number(r.reading || 0), 0) / dayReadings.length)
      : null;
    days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), value: avg, date: key });
  }
  return days;
}

// Build weekly adherence chart from medications
function buildAdherenceChart(medications) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });
    // Use current adherence status as best available signal
    const taken = medications.filter((m) => m.adherenceStatus === 'TAKEN').length;
    const missed = medications.filter((m) => m.adherenceStatus === 'MISSED' || m.missedMedicationAlert).length;
    days.push({ label, taken, missed });
  }
  return days;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, label, value, unit, sub, trend, statusColor }) {
  const TrendIcon = trend === 'up' ? MdTrendingUp : trend === 'down' ? MdTrendingDown : MdRemove;
  const trendColor = trend === 'up' ? '#DC2626' : trend === 'down' ? '#10B981' : '#94a3b8';
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[#64748b]">{label}</p>
        <div className="mt-1 flex items-end gap-1.5">
          <span className="text-2xl font-bold" style={{ color: statusColor || '#1e293b' }}>{value ?? '—'}</span>
          {unit && <span className="mb-0.5 text-sm text-[#64748b]">{unit}</span>}
          {trend && <TrendIcon size={16} style={{ color: trendColor }} className="mb-0.5" />}
        </div>
        {sub && <p className="mt-0.5 text-xs text-[#94a3b8]">{sub}</p>}
      </div>
    </div>
  );
}

function Section({ title, action, actionTo, children }) {
  return (
    <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1e293b]">{title}</h2>
        {action && (
          <Link to={actionTo} className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
            {action} <MdArrowForward size={13} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function GlucoseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  if (val === null || val === undefined) return null;
  const { label: statusLabel, color } = glucoseStatus(val);
  return (
    <div className="rounded-lg border border-[#334155]/15 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-[#334155]">{label}</p>
      <p className="mt-0.5" style={{ color }}>{val} mg/dL — {statusLabel}</p>
    </div>
  );
}

function MedRow({ med }) {
  const taken = med.adherenceStatus === 'TAKEN';
  const missed = med.adherenceStatus === 'MISSED' || med.missedMedicationAlert;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#f1f5f9] last:border-0">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${taken ? 'bg-[#10B981]/10' : missed ? 'bg-[#DC2626]/10' : 'bg-[#F59E0B]/10'}`}>
        {taken
          ? <MdCheckCircle size={18} className="text-[#10B981]" />
          : missed
            ? <MdWarning size={18} className="text-[#DC2626]" />
            : <MdSchedule size={18} className="text-[#F59E0B]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1e293b] truncate">{med.medicationName}</p>
        <p className="text-xs text-[#94a3b8]">{med.typicalTiming || med.medicationSchedule || '—'}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${taken ? 'bg-[#10B981]/10 text-[#10B981]' : missed ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
          {taken ? 'Taken' : missed ? 'Missed' : 'Pending'}
        </span>
      </div>
    </div>
  );
}

function RiskGauge({ score, level }) {
  const color = riskColor(level);
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="65%" outerRadius="90%"
            startAngle={210} endAngle={-30}
            data={[{ name: 'Risk', value: score, fill: color }]}
            barSize={14}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs font-semibold text-[#64748b]">/ 100</span>
        </div>
      </div>
      <span className="mt-1 rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${color}18`, color }}>
        {riskLabel(level)} RISK
      </span>
      <p className="mt-2 max-w-[180px] text-center text-xs text-[#94a3b8]">
        AI-supported monitoring only — not a medical diagnosis.
      </p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to, color }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-xl border border-[#334155]/10 bg-white p-4 shadow-sm hover:border-[#2563EB]/30 hover:shadow-md transition-all"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <span className="text-xs font-semibold text-[#334155] text-center leading-tight">{label}</span>
    </Link>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function PatientDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Real data state
  const [glucoseReadings, setGlucoseReadings] = useState([]);
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [riskPredictions, setRiskPredictions] = useState([]);
  const [labResults, setLabResults] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [gRes, mRes, aRes, rRes, lRes] = await Promise.allSettled([
          getGlucoseReadings(),
          getMedications(),
          getAppointments(),
          getRiskPredictions(),
          getLabResults(),
        ]);
        if (gRes.status === 'fulfilled') setGlucoseReadings(gRes.value.data || []);
        if (mRes.status === 'fulfilled') setMedications(mRes.value.data || []);
        if (aRes.status === 'fulfilled') setAppointments(aRes.value.data || []);
        if (rRes.status === 'fulfilled') setRiskPredictions(rRes.value.data || []);
        if (lRes.status === 'fulfilled') setLabResults(lRes.value.data || []);
      } catch (err) {
        showToast({ type: 'error', message: getApiErrorMessage(err, 'Failed to load dashboard data.') });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  // Derived values from real data
  const sortedGlucose = [...glucoseReadings].sort((a, b) => String(b.measuredAt || '').localeCompare(String(a.measuredAt || '')));
  const latestGlucose = sortedGlucose[0];
  const latestGlucoseVal = Number(latestGlucose?.reading) || 0;
  const glucoseStat = glucoseStatus(latestGlucoseVal);

  // Glucose trend: compare latest to previous
  const prevGlucose = Number(sortedGlucose[1]?.reading) || 0;
  const glucoseTrend = latestGlucoseVal && prevGlucose
    ? latestGlucoseVal > prevGlucose ? 'up' : latestGlucoseVal < prevGlucose ? 'down' : 'flat'
    : null;

  // HbA1c from lab results
  const hba1cResults = labResults.filter((r) => String(r.testName || '').toLowerCase() === 'hba1c')
    .sort((a, b) => String(b.resultDate || b.testedOn || '').localeCompare(String(a.resultDate || a.testedOn || '')));
  const latestHba1c = hba1cResults[0]?.result || null;

  // Blood pressure from lab results
  const bpResults = labResults.filter((r) => String(r.testName || '').toLowerCase() === 'blood pressure')
    .sort((a, b) => String(b.resultDate || b.testedOn || '').localeCompare(String(a.resultDate || a.testedOn || '')));
  const latestBP = bpResults[0]?.result || null;

  // Medication adherence rate
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.adherenceStatus === 'TAKEN').length;
  const adherenceRate = totalMeds ? Math.round((takenMeds / totalMeds) * 100) : 0;

  // Next upcoming appointment
  const upcomingAppts = appointments
    .filter(isUpcomingAppointment)
    .sort((a, b) => String(a.scheduledAt || '').localeCompare(String(b.scheduledAt || '')));
  const nextAppt = upcomingAppts[0];
  const nextApptLabel = nextAppt ? fmtDate(nextAppt.scheduledAt) : 'None scheduled';

  // Latest risk prediction
  const latestRisk = riskPredictions[0];
  const riskScore = { LOW_RISK: 25, MODERATE_RISK: 50, HIGH_RISK: 75, EMERGENCY_RISK: 100 }[latestRisk?.riskLevel] || 25;
  const riskLevel = latestRisk?.riskLevel || 'LOW_RISK';

  // Chart data
  const glucoseChartData = buildGlucoseChart(glucoseReadings);
  const adherenceChartData = buildAdherenceChart(medications);

  // Today's medications (active ones)
  const todayMeds = medications.filter((m) => !m.endDate || m.endDate >= new Date().toISOString().slice(0, 10)).slice(0, 5);

  const firstName = user?.name?.split(' ')[0] || user?.username || 'there';

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-[#e2e8f0]" />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#e2e8f0]" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-72 rounded-xl bg-[#e2e8f0]" />
          <div className="h-72 rounded-xl bg-[#e2e8f0]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="mt-1 text-2xl font-bold text-[#1e293b]">Good day, {firstName}</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Here's your health overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={MdMonitorHeart} iconBg="bg-[#2563EB]"
          label="Latest Glucose"
          value={latestGlucoseVal || '—'} unit={latestGlucoseVal ? 'mg/dL' : ''}
          trend={glucoseTrend} statusColor={latestGlucoseVal ? glucoseStat.color : '#94a3b8'}
          sub={latestGlucoseVal ? glucoseStat.label : 'No readings yet'}
        />
        <StatCard
          icon={MdFavorite} iconBg="bg-[#10B981]"
          label="HbA1c"
          value={latestHba1c || '—'} unit={latestHba1c ? '%' : ''}
          sub={latestHba1c ? 'Last lab result' : 'No lab results yet'}
        />
        <StatCard
          icon={MdMonitorHeart} iconBg="bg-[#8b5cf6]"
          label="Blood Pressure"
          value={latestBP || '—'} unit={latestBP ? 'mmHg' : ''}
          sub={latestBP ? 'Last reading' : 'No readings yet'}
        />
        <StatCard
          icon={MdMedication} iconBg="bg-[#F59E0B]"
          label="Medication Adherence"
          value={totalMeds ? `${adherenceRate}%` : '—'}
          trend={totalMeds ? (adherenceRate >= 80 ? 'up' : 'down') : null}
          sub={totalMeds ? `${takenMeds} of ${totalMeds} taken` : 'No medications'}
        />
        <StatCard
          icon={MdCalendarMonth} iconBg="bg-[#0ea5e9]"
          label="Next Appointment"
          value={nextApptLabel}
          sub={nextAppt?.appointmentType || (nextAppt ? 'Upcoming visit' : 'No upcoming visits')}
        />
        <StatCard
          icon={MdPsychology}
          iconBg={riskLevel === 'LOW_RISK' ? 'bg-[#10B981]' : riskLevel === 'MODERATE_RISK' ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'}
          label="AI Risk Level"
          value={riskLabel(riskLevel)}
          sub={latestRisk ? 'Latest prediction' : 'No predictions yet'}
          statusColor={riskColor(riskLevel)}
        />
      </div>

      {/* Glucose Chart + Risk Gauge */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Section title="7-Day Glucose Trend" action="View all readings" actionTo="/dashboard/monitoring/glucose">
          {glucoseReadings.length === 0 ? (
            <EmptyState title="No glucose readings" message="Log your first glucose reading to see your trend." />
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={glucoseChartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 220]} />
                    <Tooltip content={<GlucoseTooltip />} />
                    <ReferenceLine y={70} stroke="#DC2626" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'Low', fill: '#DC2626', fontSize: 10, position: 'insideTopLeft' }} />
                    <ReferenceLine y={140} stroke="#F59E0B" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'Target', fill: '#F59E0B', fontSize: 10, position: 'insideTopLeft' }} />
                    <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fill="url(#glucoseGrad)"
                      dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 5 }}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-[#94a3b8]">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#DC2626]" /> Below 70 — Low</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#10B981]" /> 70–140 — Normal</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#F59E0B]" /> Above 140 — Elevated</span>
              </div>
            </>
          )}
        </Section>

        <Section title="AI Risk Score" action="View details" actionTo="/dashboard/ai-risk">
          <div className="flex h-64 items-center justify-center">
            {riskPredictions.length === 0 ? (
              <div className="text-center">
                <p className="text-sm text-[#94a3b8]">No risk predictions yet.</p>
                <Link to="/dashboard/ai-risk" className="mt-2 inline-block text-xs font-semibold text-[#2563EB] hover:underline">
                  Generate first prediction
                </Link>
              </div>
            ) : (
              <RiskGauge score={riskScore} level={riskLevel} />
            )}
          </div>
        </Section>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[#1e293b]">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction icon={MdMonitorHeart} label="Log Reading" to="/dashboard/monitoring/glucose/new" color="#2563EB" />
          <QuickAction icon={MdMedication} label="Medications" to="/dashboard/medications" color="#F59E0B" />
          <QuickAction icon={MdCalendarMonth} label="Appointments" to="/dashboard/appointments" color="#0ea5e9" />
          <QuickAction icon={MdPsychology} label="AI Risk Check" to="/dashboard/ai-risk" color="#10B981" />
        </div>
      </div>

      {/* Medication Schedule + Adherence Chart */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Section title="Today's Medications" action="Full schedule" actionTo="/dashboard/medications">
          {todayMeds.length === 0 ? (
            <EmptyState title="No medications" message="No active medications found." />
          ) : (
            <>
              <div className="divide-y divide-[#f1f5f9]">
                {todayMeds.map((med) => <MedRow key={med.id} med={med} />)}
              </div>
              {todayMeds.some((m) => m.adherenceStatus !== 'TAKEN') && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#FEF3C7] px-3 py-2 text-xs text-[#92400e]">
                  <MdWarning size={14} />
                  You have pending medications today. Please take them on time.
                </div>
              )}
            </>
          )}
        </Section>

        <Section title="Weekly Medication Adherence" action="View adherence" actionTo="/dashboard/medications/adherence">
          {medications.length === 0 ? (
            <EmptyState title="No medication data" message="Medication adherence will appear here once medications are added." />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adherenceChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={14}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="taken" name="Taken" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missed" name="Missed" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

export default PatientDashboard;
