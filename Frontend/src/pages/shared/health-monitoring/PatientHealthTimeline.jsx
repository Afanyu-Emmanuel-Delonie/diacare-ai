import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdMonitorHeart, MdFavorite, MdScale, MdScience,
  MdArrowBack, MdFilterList,
} from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import useToast from '../../../hooks/useToast.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import {
  getGlucoseReadings, getLabResults, normalizeMonitoringRecord,
} from '../../../services/healthMonitoringService.js';

const TYPE_META = {
  glucose:       { label: 'Blood Glucose', color: '#2563EB', icon: MdMonitorHeart, unit: 'mg/dL' },
  bloodPressure: { label: 'Blood Pressure', color: '#8b5cf6', icon: MdFavorite,    unit: 'mmHg' },
  weight:        { label: 'Weight',         color: '#10B981', icon: MdScale,        unit: 'kg' },
  hba1c:         { label: 'HbA1c',          color: '#F59E0B', icon: MdScience,      unit: '%' },
  labs:          { label: 'Lab Result',     color: '#0ea5e9', icon: MdScience,      unit: '' },
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'glucose', label: 'Glucose' },
  { key: 'bloodPressure', label: 'Blood Pressure' },
  { key: 'weight', label: 'Weight' },
  { key: 'hba1c', label: 'HbA1c' },
  { key: 'labs', label: 'Labs' },
];

function labType(testName) {
  const n = String(testName || '').toLowerCase();
  if (n === 'blood pressure') return 'bloodPressure';
  if (n === 'weight') return 'weight';
  if (n === 'hba1c') return 'hba1c';
  return 'labs';
}

function groupByDate(records) {
  const groups = {};
  for (const r of records) {
    const day = r.dateTime ? String(r.dateTime).slice(0, 10) : 'Unknown';
    if (!groups[day]) groups[day] = [];
    groups[day].push(r);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function fmtDay(dateStr) {
  if (dateStr === 'Unknown') return 'Unknown Date';
  const d = new Date(dateStr);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function fmtTime(val) {
  if (!val) return '';
  return new Date(val).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// ── Timeline Entry ────────────────────────────────────────────────────────────
function TimelineEntry({ record, isLast }) {
  const meta = TYPE_META[record.type] || TYPE_META.labs;
  const Icon = meta.icon;

  return (
    <div className="flex gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm" style={{ background: `${meta.color}18`, border: `2px solid ${meta.color}30` }}>
          <Icon size={16} style={{ color: meta.color }} />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-[#e2e8f0]" style={{ minHeight: 24 }} />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
        <div className="flex flex-col gap-1 rounded-xl border border-[#334155]/10 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#1e293b]">{meta.label} recorded</p>
              <p className="mt-0.5 text-xs text-[#94a3b8]">{fmtTime(record.dateTime)}</p>
            </div>
            <StatusBadge status={record.status || 'RECORDED'} />
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <span className="rounded-lg px-2.5 py-1 text-sm font-bold" style={{ background: `${meta.color}12`, color: meta.color }}>
              {record.value} {record.unit || meta.unit}
            </span>
            {record.patientName && (
              <span className="rounded-lg bg-[#f1f5f9] px-2.5 py-1 text-xs text-[#64748b]">
                {record.patientName}
              </span>
            )}
          </div>
          {record.notes && record.notes !== 'No notes recorded.' && (
            <p className="mt-1 text-xs text-[#94a3b8]">{record.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function PatientHealthTimeline() {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const [gRes, lRes] = await Promise.all([getGlucoseReadings(), getLabResults()]);
        const glucose = (gRes.data || []).map((r) => normalizeMonitoringRecord(r, 'glucose'));
        const labs = (lRes.data || []).map((r) => normalizeMonitoringRecord(r, labType(r.testName)));
        setRecords([...glucose, ...labs].sort((a, b) => new Date(b.dateTime || 0) - new Date(a.dateTime || 0)));
      } catch (err) {
        const msg = getApiErrorMessage(err, 'Failed to load health timeline.');
        setError(msg);
        showToast({ type: 'error', message: msg });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const filtered = useMemo(() =>
    typeFilter === 'all' ? records : records.filter((r) => r.type === typeFilter),
    [records, typeFilter]
  );

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link to="/dashboard/monitoring" className="mb-2 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
          <MdArrowBack size={13} /> Monitoring Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-[#1e293b]">Health Timeline</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">Chronological view of all monitoring activities.</p>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <MdFilterList size={16} className="text-[#94a3b8]" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key} type="button"
            onClick={() => setTypeFilter(opt.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              typeFilter === opt.key
                ? 'bg-[#2563EB] text-white'
                : 'border border-[#334155]/15 bg-white text-[#64748b] hover:border-[#2563EB]/40 hover:text-[#2563EB]'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#94a3b8]">{filtered.length} records</span>
      </div>

      {error && (
        <div className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-sm text-[#DC2626]">{error}</div>
      )}

      {!error && filtered.length === 0 && (
        <EmptyState title="No timeline activity" message="No monitoring records found for the selected filter." />
      )}

      {/* Grouped timeline */}
      {grouped.map(([day, dayRecords]) => (
        <div key={day}>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-[#64748b]">{fmtDay(day)}</span>
            <div className="flex-1 border-t border-[#e2e8f0]" />
            <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold text-[#94a3b8]">
              {dayRecords.length}
            </span>
          </div>
          <div>
            {dayRecords.map((r, i) => (
              <TimelineEntry key={`${r.type}-${r.id}`} record={r} isLast={i === dayRecords.length - 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatientHealthTimeline;
