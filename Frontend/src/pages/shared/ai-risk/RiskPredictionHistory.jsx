import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdChevronLeft, MdChevronRight, MdArrowBack } from 'react-icons/md';
import { Link } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useToast from '../../../hooks/useToast.js';
import { filterRiskPredictions, getRiskPredictions, safeRiskText } from '../../../services/riskPredictionService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import RiskLevelBadge from './RiskLevelBadge.jsx';
import RiskSafetyNotice from './RiskSafetyNotice.jsx';
import { formatDateTime, getPatientOptions } from './riskPageUtils.js';

const PAGE_SIZE = 10;
const LEVELS = ['ALL', 'LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK', 'EMERGENCY_RISK'];

function RiskPredictionHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  useEffect(() => {
    getRiskPredictions()
      .then((res) => setPredictions(res.data || []))
      .catch((err) => showToast({ type: 'error', message: getApiErrorMessage(err, 'Unable to load risk history.') }))
      .finally(() => setLoading(false));
  }, [showToast]);

  const filtered = useMemo(() =>
    filterRiskPredictions(predictions, { search, riskLevel: levelFilter }),
    [predictions, search, levelFilter]
  );

  useEffect(() => setPage(0), [search, levelFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-5">
      <RiskSafetyNotice />

      <div>
        <Link to="/dashboard/ai-risk" className="mb-2 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline">
          <MdArrowBack size={13} /> Risk Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#1e293b]">Risk Prediction History</h1>
        <p className="mt-0.5 text-sm text-[#64748b]">All AI-supported risk records for accessible patients.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-[#334155]/10 bg-white px-3 py-2 shadow-sm">
          <MdSearch size={16} className="text-[#94a3b8]" />
          <input type="text" placeholder="Search patient, type, explanation..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#334155] outline-none placeholder:text-[#94a3b8]" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[#334155]/10 bg-white p-1 shadow-sm">
          {LEVELS.map((l) => (
            <button key={l} type="button" onClick={() => setLevelFilter(l)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${levelFilter === l ? 'bg-[#2563EB] text-white' : 'text-[#64748b] hover:text-[#1e293b]'}`}>
              {l === 'ALL' ? 'All' : l.replace('_RISK', '').replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && <EmptyState title="No risk records found" message="No records match the current filters." />}

      {filtered.length > 0 && (
        <div className="rounded-xl border border-[#334155]/10 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="mobile-card-table risk-history-table w-full text-left">
              <thead>
                <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                  {['Date/Time', 'Patient', 'Risk Level', 'Type', 'Glucose', 'Review', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748b]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 text-sm text-[#334155]">{formatDateTime(p.predictionDateTime)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1e293b]">{p.patientName}</td>
                    <td className="px-4 py-3"><RiskLevelBadge level={p.riskLevel} /></td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{p.riskType || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#334155]">{p.bloodGlucoseValue || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.doctorReviewStatus === 'REVIEWED' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                        {p.doctorReviewStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button"
                        onClick={() => navigate(`/dashboard/ai-risk/patient-summary?patientId=${p.patientId || ''}`)}
                        className="rounded-lg border border-[#334155]/15 px-2.5 py-1 text-xs font-medium text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                        More details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#f1f5f9] px-5 py-3">
              <span className="text-xs text-[#94a3b8]">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
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
      )}
    </div>
  );
}

export default RiskPredictionHistory;
