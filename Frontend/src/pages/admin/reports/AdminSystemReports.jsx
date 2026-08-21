import { useState } from 'react';
import Badge from '../../../components/common/Badge.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAdminSystemReport } from '../../../services/reportService.js';
import { displayValue, formatLabel } from '../../../utils/reportFormatting.js';
import ActivitySection from '../../shared/reports/ActivitySection.jsx';
import ReportFilters from '../../shared/reports/ReportFilters.jsx';

function AdminSystemReports() {
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const loadReport = (nextFilters) => {
    setLoading(true);
    setError('');
    getAdminSystemReport(nextFilters)
      .then(setReport)
      .catch(() => {
        setError('Unable to load the system report.');
        showToast({ type: 'error', message: 'Unable to load the system report.' });
      })
      .finally(() => setLoading(false));
  };

  const metrics = Object.entries(report?.metrics || report?.summary || {});

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="info">ADMIN</Badge>
        <h1 className="mt-3 text-2xl font-bold text-[#334155]">System Reports</h1>
        <p className="mt-1 text-sm text-[#334155]/80">System-wide activity and usage metrics.</p>
      </div>

      <ReportFilters filters={filters} onChange={setFilters} onSubmit={loadReport} loading={loading} />

      {loading && <LoadingSpinner label="Loading system report..." />}
      {!loading && error && <EmptyState title="System report could not be loaded" message={error} />}
      {!loading && !error && !report && (
        <EmptyState title="No report generated yet" message="Use the filters above to generate a system report." />
      )}
      {!loading && !error && report && (
        <>
          {metrics.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(([key, value]) => (
                <div key={key} className="rounded-lg border border-[#334155]/15 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#334155]/70">{formatLabel(key)}</p>
                  <p className="mt-1 text-xl font-bold text-[#334155]">{displayValue(value)}</p>
                </div>
              ))}
            </div>
          )}
          <ActivitySection title="Recent System Activity" items={report.activities || report.recentActivity || []} />
        </>
      )}
    </div>
  );
}

export default AdminSystemReports;
