import { useEffect, useState } from 'react';
import Badge from '../../../components/common/Badge.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import Table from '../../../components/common/Table.jsx';
import useToast from '../../../hooks/useToast.js';
import { filterReportHistory, getReportHistory } from '../../../services/reportService.js';
import { formatDateTime } from '../../../utils/reportFormatting.js';
import ReportDownloadActions from './ReportDownloadActions.jsx';
import ReportFilters from './ReportFilters.jsx';

function ReportHistoryPage() {
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    setError('');
    getReportHistory()
      .then(setReports)
      .catch(() => {
        setError('Unable to load report history.');
        showToast({ type: 'error', message: 'Unable to load report history.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const applyFilters = (nextFilters) => {
    setLoading(true);
    setError('');
    filterReportHistory(nextFilters)
      .then(setReports)
      .catch(() => {
        setError('Unable to filter report history.');
        showToast({ type: 'error', message: 'Unable to filter report history.' });
      })
      .finally(() => setLoading(false));
  };

  const columns = [
    { key: 'title', header: 'Report', render: (report) => report.title || `Report #${report.id}` },
    { key: 'generatedOn', header: 'Generated', render: (report) => formatDateTime(report.generatedOn || report.createdAt) },
    { key: 'content', header: 'Summary', render: (report) => <Badge variant="info">{report.content ? 'Available' : 'No summary'}</Badge> },
    { key: 'actions', header: '', sortable: false, render: (report) => <ReportDownloadActions reportId={report.id} /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">Report History</h1>
        <p className="mt-2 text-sm text-[#334155]/80">Browse and filter previously generated reports.</p>
      </div>

      <ReportFilters filters={filters} onChange={setFilters} onSubmit={applyFilters} loading={loading} />

      {loading && <LoadingSpinner label="Loading report history..." />}
      {!loading && error && <EmptyState title="Report history could not be loaded" message={error} />}
      {!loading && !error && (
        <Table columns={columns} data={reports} emptyMessage="No reports match the selected filters." />
      )}
    </div>
  );
}

export default ReportHistoryPage;
