import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { MdAdd, MdArrowBack, MdArrowForward, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { getPatients } from '../../../services/patientService.js';
import {
  getGlucoseReadings, getGlucoseReadingsByPatient,
  getLabResults,
} from '../../../services/healthMonitoringService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

const TYPE_CONFIG = {
  glucose: {
    title: 'Blood Glucose', unit: 'mg/dL', color: '#2563EB',
    route: 'glucose', suffix: ' mg/dL',
    refLines: [{ y: 70, color: '#DC2626', label: 'Low' }, { y: 140, color: '#F59E0B', label: 'Target' }],
    getValue: (r) => r.reading, getDate: (r) => r.measuredAt,
    parseChart: (r) => Number(r.reading),
    isGlucose: true,
  },
  bloodPressure: {
    title: 'Blood Pressure', unit: 'mmHg', color: '#8b5cf6',
    route: 'blood-pressure', suffix: ' mmHg',
    refLines: [{ y: 120, color: '#10B981', label: 'Normal' }, { y: 140, color: '#DC2626', label: 'High' }],
    getValue: (r) => r.result, getDate: (r) => r.testedOn,
    parseChart: (r) => Number(String(r.result || '').split('/')[0]),
    labTestName: 'Blood Pressure',
  },
  weight: {
    title: 'Weight', unit: 'kg', color: '#10B981',
    route: 'weight', suffix: ' kg', refLines: [],
    getValue: (r) => r.result, getDate: (r) => r.testedOn,
    parseChart: (r) => Number.parseFloat(r.result),
    labTestName: 'Weight',
  },
  hba1c: {
    title: 'HbA1c', unit: '%', color: '#F59E0B',
    route: 'hba1c', suffix: '%',
    refLines: [{ y: 5.7, color: '#F59E0B', label: 'Pre-diabetic' }, { y: 6.5, color: '#DC2626', label: 'Diabetic' }],
    getValue: (r) => r.result, getDate: (r) => r.testedOn,
    parseChart: (r) => Number.parseFloat(r.result),
    labTestName: 'HbA1c',
  },
  labs: {
    title: 'Lab Results', unit: '', color: '#0ea5e9',
    route: 'labs', suffix: '', refLines: [],
    getValue: (r) => r.result, getDate: (r) => r.testedOn,
    parseChart: (r) => Number.parseFloat(r.result),
    labTestName: null,
  },
};

const RANGE_OPTIONS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'All', days: 9999 },
];

function filterByDays(records, days, getDate) {
  if (days >= 9999) return records;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return records.filter((r) => {
    const d = getDate(r);
    return !d || new Date(d) >= start;
  });
}

function fmtDate(val) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtShort(val) {
  return val ? String(val).slice(5, 10) : '';
}

function calcStats(records, parseChart) {
  const vals = records.map(parseChart).filter(Number.isFinite);
  if (!vals.length) return null;
  return {
    avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
    min: Math.min(...vals),
    max: Math.max(...vals),
    count: vals.length,
  };
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-[#334155]/10 bg-white px-5 py-3 shadow-sm">
      <span className="text-xs font-medium text-[#64748b]">{label}</span>
      <span className="mt-0.5 text-xl font-bold" style={{ color }}>{value ?? '—'}</span>
    </div>
  );
}

// ── Table row ─────────────────────────────────────────────────────────────────
function RecordRow({ record, config, canEdit, navigate }) {
  const val = config.getValue(record);
  const date = config.getDate(record);
  return (
    <tr className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
      <td className="px-4 py-3 text-sm text-[#334155]">{fmtDate(date)}</td>
      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
        {val} <span className="font-normal text-[#94a3b8]">{config.unit}</span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={record.status || 'RECORDED'} />
      </td>
      <td className="px-4 py-3 text-sm text-[#94a3b8]">{record.notes || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/monitoring/${config.route}/${record.id}`)}
            className="rounded-lg border border-[#334155]/15 px-3 py-1 text-xs font-medium text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            More details
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => navigate(`/dashboard/monitoring/${config.route}/${record.id}/edit`)}
              className="rounded-lg border border-[#334155]/15 px-3 py-1 text-xs font-medium text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function HealthMonitoringPage({ type }) {
  const config = TYPE_CONFIG[type];
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rangeDays, setRangeDays] = useState(30);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const canAdd =
    [ROLES.DOCTOR, ROLES.NURSE].includes(userRole) ||
    (userRole === ROLES.PATIENT && ['glucose', 'weight'].includes(type));
  const canEdit = [ROLES.DOCTOR, ROLES.NURSE].includes(userRole);

  useEffect(() => {
    getPatients()
      .then((res) => {
        const list = res.data || [];
        setPatients(list);
        if (list.length === 1) setSelectedPatientId(String(list[0].id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        let raw = [];
        if (config.isGlucose) {
          const res = selectedPatientId
            ? await getGlucoseReadingsByPatient(selectedPatientId)
            : await getGlucoseReadings();
          raw = res.data || [];
        } else {
          const res = await getLabResults();
          raw = (res.data || []).filter((r) => {
            const matchPatient = !selectedPatientId || String(r.patient?.id || r.patientId) === String(selectedPatientId);
            const matchType = !config.labTestName || String(r.testName || '').toLowerCase() === config.labTestName.toLowerCase();
            return matchPatient && matchType;
          });
        }
        setRecords(raw.sort((a, b) => new Date(config.getDate(b) || 0) - new Date(config.getDate(a) || 0)));
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Failed to load records.');
        setError(msg);
        showToast({ type: 'error', message: msg });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [type, selectedPatientId, showToast]);

  const filtered = useMemo(() => filterByDays(records, rangeDays, config.getDate), [records, rangeDays]);

  const chartData = useMemo(() =>
    [...filtered].reverse()
      .map((r) => ({ label: fmtShort(config.getDate(r)), value: config.parseChart(r) }))
      .filter((d) => Number.isFinite(d.value)),
    [filtered]
  );

  const stats = useMemo(() => calcStats(filtered, config.parseChart), [filtered]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => setPage(0), [rangeDays, selectedPatientId, type]);

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/dashboard/monitoring" className="mb-2 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
            <MdArrowBack size={13} /> Monitoring Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#1e293b]">{config.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAdd && (
            <Link to={`/dashboard/monitoring/${config.route}/new${selectedPatientId ? `?patientId=${selectedPatientId}` : ''}`}>
              <button type="button" className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d4ed8] transition-colors">
                <MdAdd size={16} /> Add Record
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Patient filter (non-patient roles) */}
      {patients.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[#64748b]">Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="rounded-lg border border-[#334155]/15 bg-white px-3 py-2 text-sm text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          >
            <option value="">All patients</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
          </select>
        </div>
      )}

      {/* Range tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-[#334155]/10 bg-white p-1 shadow-sm w-fit">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.days} type="button"
            onClick={() => setRangeDays(opt.days)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              rangeDays === opt.days ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>
      )}

      {!error && filtered.length === 0 && (
        <EmptyState title="No records found" message="No data available for the selected period." />
      )}

      {!error && filtered.length > 0 && (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill label="Average" value={`${stats.avg}${config.unit}`} color={config.color} />
              <StatPill label="Minimum" value={`${stats.min}${config.unit}`} color="#10B981" />
              <StatPill label="Maximum" value={`${stats.max}${config.unit}`} color="#DC2626" />
              <StatPill label="Readings" value={stats.count} color="#64748b" />
            </div>
          )}

          {/* Chart */}
          <div className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[#1e293b]">{config.title} Trend</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="typeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [`${v}${config.suffix}`, config.title]}
                  />
                  {config.refLines.map((r) => (
                    <ReferenceLine key={r.y} y={r.y} stroke={r.color} strokeDasharray="4 3" strokeOpacity={0.6}
                      label={{ value: r.label, fill: r.color, fontSize: 10, position: 'insideTopRight' }}
                    />
                  ))}
                  <Area type="monotone" dataKey="value" stroke={config.color} strokeWidth={2.5}
                    fill="url(#typeGrad)" dot={{ r: 3.5, fill: config.color, strokeWidth: 0 }} activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[#334155]/10 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f1f5f9]">
              <h2 className="text-sm font-semibold text-[#1e293b]">Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="mobile-card-table monitoring-table w-full text-left">
                <thead>
                  <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                    {['Date', 'Value', 'Status', 'Notes', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748b]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <RecordRow key={r.id} record={r} config={config} canEdit={canEdit} navigate={navigate} />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
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
        </>
      )}
    </div>
  );
}

export default HealthMonitoringPage;
