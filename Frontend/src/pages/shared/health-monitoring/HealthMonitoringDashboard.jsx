import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  MdMonitorHeart, MdFavorite, MdScale, MdScience,
  MdArrowForward, MdTrendingUp, MdTrendingDown, MdRemove,
  MdAdd, MdAccessTime,
} from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import useToast from '../../../hooks/useToast.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import {
  getGlucoseReadings, getLabResults, normalizeMonitoringRecord,
} from '../../../services/healthMonitoringService.js';

const RANGE_OPTIONS = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

// ── Glucose status helper ─────────────────────────────────────────────────────
function glucoseStatus(val) {
  const n = Number(val);
  if (!n) return { label: 'No data', color: '#94a3b8', variant: 'neutral' };
  if (n < 70) return { label: 'Low', color: '#DC2626', variant: 'critical' };
  if (n <= 140) return { label: 'Normal', color: '#10B981', variant: 'success' };
  if (n <= 180) return { label: 'Elevated', color: '#F59E0B', variant: 'warning' };
  return { label: 'High', color: '#DC2626', variant: 'critical' };
}

function bpStatus(val) {
  const sys = Number(String(val || '').split('/')[0]);
  if (!sys) return { label: 'No data', color: '#94a3b8' };
  if (sys < 90) return { label: 'Low', color: '#DC2626' };
  if (sys <= 120) return { label: 'Normal', color: '#10B981' };
  if (sys <= 139) return { label: 'Elevated', color: '#F59E0B' };
  return { label: 'High', color: '#DC2626' };
}

function hba1cStatus(val) {
  const n = Number(val);
  if (!n) return { label: 'No data', color: '#94a3b8' };
  if (n < 5.7) return { label: 'Normal', color: '#10B981' };
  if (n < 6.5) return { label: 'Pre-diabetic', color: '#F59E0B' };
  return { label: 'Diabetic range', color: '#DC2626' };
}

function filterByRange(records, days) {
  if (days === 0) {
    const today = new Date().toISOString().slice(0, 10);
    return records.filter((r) => String(r.dateTime || '').slice(0, 10) === today);
  }
  const start = new Date();
  start.setDate(start.getDate() - days);
  return records.filter((r) => !r.dateTime || new Date(r.dateTime) >= start);
}

function shortDate(val) {
  return val ? String(val).slice(5, 10) : '';
}

function fmtDateTime(val) {
  return val ? new Date(val).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, iconColor, label, value, unit, status, statusColor, to, trend }) {
  const TrendIcon = trend === 'up' ? MdTrendingUp : trend === 'down' ? MdTrendingDown : MdRemove;
  const trendColor = trend === 'up' ? '#DC2626' : trend === 'down' ? '#10B981' : '#94a3b8';

  return (
    <Link to={to} className="group flex flex-col gap-3 rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm hover:border-[#2563EB]/30 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${iconColor}18` }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <MdArrowForward size={16} className="text-[#cbd5e1] group-hover:text-[#2563EB] transition-colors" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[#64748b]">{label}</p>
        <div className="mt-1 flex items-end gap-1.5">
          <span className="text-2xl font-bold text-[#1e293b]">{value ?? '—'}</span>
          {unit && <span className="mb-0.5 text-sm text-[#94a3b8]">{unit}</span>}
          {trend && <TrendIcon size={15} style={{ color: trendColor }} className="mb-0.5" />}
        </div>
        {status && (
          <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${statusColor}18`, color: statusColor }}>
            {status}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Chart Section ─────────────────────────────────────────────────────────────
function ChartSection({ title, data, color, suffix, refLines = [], to }) {
  const isEmpty = !data.length;
  return (
    <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1e293b]">{title}</h2>
        <Link to={to} className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
          View all <MdArrowForward size={13} />
        </Link>
      </div>
      {isEmpty ? (
        <div className="flex h-44 items-center justify-center rounded-lg bg-[#f8fafc] text-sm text-[#94a3b8]">
          No data for this period
        </div>
      ) : (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}${suffix}`, title]}
              />
              {refLines.map((r) => (
                <ReferenceLine key={r.y} y={r.y} stroke={r.color} strokeDasharray="4 3" strokeOpacity={0.6} />
              ))}
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${color.replace('#', '')})`} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Timeline item ─────────────────────────────────────────────────────────────
function TimelineItem({ record }) {
  const typeColors = {
    glucose: '#2563EB', bloodPressure: '#8b5cf6',
    weight: '#10B981', hba1c: '#F59E0B', labs: '#0ea5e9',
  };
  const color = typeColors[record.type] || '#94a3b8';
  return (
    <div className="flex gap-3 py-2.5 border-b border-[#f1f5f9] last:border-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}18` }}>
        <MdAccessTime size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1e293b]">{record.label} recorded</p>
        <p className="text-xs text-[#94a3b8]">{fmtDateTime(record.dateTime)}</p>
      </div>
      <div className="shrink-0">
        <span className="text-sm font-semibold text-[#334155]">{record.value} {record.unit}</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function HealthMonitoringDashboard() {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rangeDays, setRangeDays] = useState(7);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [gRes, lRes] = await Promise.all([getGlucoseReadings(), getLabResults()]);
        const glucose = (gRes.data || []).map((r) => normalizeMonitoringRecord(r, 'glucose'));
        const labs = (lRes.data || []).map((r) => normalizeMonitoringRecord(r, labType(r.testName)));
        setRecords([...glucose, ...labs].sort((a, b) => new Date(b.dateTime || 0) - new Date(a.dateTime || 0)));
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Failed to load health monitoring data.');
        setError(msg);
        showToast({ type: 'error', message: msg });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const filtered = useMemo(() => filterByRange(records, rangeDays), [records, rangeDays]);

  const latest = (type) => filtered.find((r) => r.type === type);
  const chartData = (type, parseVal) =>
    [...filtered.filter((r) => r.type === type)]
      .reverse()
      .map((r) => ({ label: shortDate(r.dateTime), value: parseVal(r.value) }))
      .filter((d) => Number.isFinite(d.value));

  const latestGlucose = latest('glucose');
  const latestBP = latest('bloodPressure');
  const latestWeight = latest('weight');
  const latestHba1c = latest('hba1c');

  const glucoseStat = glucoseStatus(latestGlucose?.value);
  const bpStat = bpStatus(latestBP?.value);
  const hba1cStat = hba1cStatus(latestHba1c?.value);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <EmptyState title="Could not load monitoring data" message={error} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-[#1e293b]">Monitoring Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">Observational health data. AI risk prediction is handled separately.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[#334155]/10 bg-white p-1 shadow-sm">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              type="button"
              onClick={() => setRangeDays(opt.days)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                rangeDays === opt.days
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={MdMonitorHeart} iconColor="#2563EB"
          label="Blood Glucose" value={latestGlucose?.value} unit="mg/dL"
          status={glucoseStat.label} statusColor={glucoseStat.color}
          to="/dashboard/monitoring/glucose"
        />
        <MetricCard
          icon={MdFavorite} iconColor="#8b5cf6"
          label="Blood Pressure" value={latestBP?.value} unit="mmHg"
          status={bpStat.label} statusColor={bpStat.color}
          to="/dashboard/monitoring/blood-pressure"
        />
        <MetricCard
          icon={MdScale} iconColor="#10B981"
          label="Weight" value={latestWeight?.value} unit="kg"
          to="/dashboard/monitoring/weight"
        />
        <MetricCard
          icon={MdScience} iconColor="#F59E0B"
          label="HbA1c" value={latestHba1c?.value} unit="%"
          status={hba1cStat.label} statusColor={hba1cStat.color}
          to="/dashboard/monitoring/hba1c"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartSection
          title="Blood Glucose Trend" color="#2563EB" suffix=" mg/dL"
          to="/dashboard/monitoring/glucose"
          data={chartData('glucose', (v) => Number(v))}
          refLines={[{ y: 70, color: '#DC2626' }, { y: 140, color: '#F59E0B' }]}
        />
        <ChartSection
          title="Blood Pressure Trend" color="#8b5cf6" suffix=" mmHg"
          to="/dashboard/monitoring/blood-pressure"
          data={chartData('bloodPressure', (v) => Number(String(v).split('/')[0]))}
          refLines={[{ y: 120, color: '#10B981' }, { y: 140, color: '#DC2626' }]}
        />
        <ChartSection
          title="Weight Trend" color="#10B981" suffix=" kg"
          to="/dashboard/monitoring/weight"
          data={chartData('weight', (v) => Number.parseFloat(v))}
        />
        <ChartSection
          title="HbA1c Trend" color="#F59E0B" suffix="%"
          to="/dashboard/monitoring/hba1c"
          data={chartData('hba1c', (v) => Number.parseFloat(v))}
          refLines={[{ y: 5.7, color: '#F59E0B' }, { y: 6.5, color: '#DC2626' }]}
        />
      </div>

      {/* Recent Activity + Quick Links */}
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1e293b]">Recent Activity</h2>
            <Link to="/dashboard/monitoring/timeline" className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
              Full timeline <MdArrowForward size={13} />
            </Link>
          </div>
          {filtered.length ? (
            <div>
              {filtered.slice(0, 8).map((r) => <TimelineItem key={`${r.type}-${r.id}`} record={r} />)}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-[#94a3b8]">No activity for this period</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: 'Log Glucose', to: '/dashboard/monitoring/glucose/new', color: '#2563EB', icon: MdAdd },
            { label: 'View Timeline', to: '/dashboard/monitoring/timeline', color: '#8b5cf6', icon: MdAccessTime },
            { label: 'Blood Pressure', to: '/dashboard/monitoring/blood-pressure', color: '#10B981', icon: MdFavorite },
            { label: 'Lab Results', to: '/dashboard/monitoring/labs', color: '#F59E0B', icon: MdScience },
          ].map(({ label, to, color, icon: Icon }) => (
            <Link
              key={to} to={to}
              className="flex items-center gap-3 rounded-xl border border-[#334155]/10 bg-white px-4 py-3 shadow-sm hover:border-[#2563EB]/30 hover:shadow-md transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className="text-sm font-medium text-[#334155]">{label}</span>
              <MdArrowForward size={14} className="ml-auto text-[#cbd5e1]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function labType(testName) {
  const n = String(testName || '').toLowerCase();
  if (n === 'blood pressure') return 'bloodPressure';
  if (n === 'weight') return 'weight';
  if (n === 'hba1c') return 'hba1c';
  return 'labs';
}

export default HealthMonitoringDashboard;
