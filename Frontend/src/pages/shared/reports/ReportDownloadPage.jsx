import { useEffect, useState } from 'react';
import Card from '../../../components/common/Card.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import Input from '../../../components/common/Input.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { getReportHistory } from '../../../services/reportService.js';
import { formatDateTime } from '../../../utils/reportFormatting.js';
import ReportDownloadActions from './ReportDownloadActions.jsx';

function ReportDownloadPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualId, setManualId] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    getReportHistory()
      .then(setReports)
      .catch(() => showToast({ type: 'error', message: 'Unable to load available reports.' }))
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">Report Downloads</h1>
        <p className="mt-2 text-sm text-[#334155]/80">Download a generated report as JSON, PDF, Excel, or CSV.</p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-[#334155]">Download by report ID</h2>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
          <div className="md:w-56">
            <Input id="manualReportId" label="Report ID" type="number" min="1" value={manualId} onChange={(event) => setManualId(event.target.value)} />
          </div>
          <ReportDownloadActions reportId={manualId} />
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner label="Loading available reports..." />
      ) : reports.length > 0 ? (
        <Card>
          <h2 className="text-base font-semibold text-[#334155]">Recent reports</h2>
          <div className="mt-4 divide-y divide-[#334155]/15">
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#334155]">{report.title || `Report #${report.id}`}</p>
                  <p className="text-xs text-[#334155]/65">{formatDateTime(report.generatedOn || report.createdAt)}</p>
                </div>
                <ReportDownloadActions reportId={report.id} />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState title="No reports available" message="Generate a report first, then download it here." />
      )}
    </div>
  );
}

export default ReportDownloadPage;
