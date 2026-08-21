import { useState } from 'react';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import useToast from '../../../hooks/useToast.js';
import { downloadReportFile } from '../../../services/reportService.js';
import ReportDownloadActions from './ReportDownloadActions.jsx';

function ReportDownloadPage() {
  const [reportId, setReportId] = useState('');
  const { showToast } = useToast();

  async function handleDownload(selectedReportId, format) {
    if (!selectedReportId) {
      showToast({ type: 'warning', message: 'Enter a report ID first.' });
      return;
    }

    try {
      await downloadReportFile(selectedReportId, format);
      showToast({ type: 'success', message: `${format} download started.` });
    } catch {
      showToast({ type: 'error', message: 'Unable to download this report.' });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">Report Download Page</h1>
        <p className="mt-2 text-sm text-[#334155]/80">
          Downloads are protected by JWT and backend role permissions. Unauthorized report IDs will be rejected.
        </p>
      </div>

      <Card className="space-y-4">
        <div className="max-w-sm">
          <Input
            label="Report ID"
            id="reportId"
            type="number"
            min="1"
            value={reportId}
            onChange={(event) => setReportId(event.target.value)}
          />
        </div>
        <ReportDownloadActions reportId={reportId} onDownload={handleDownload} disabled={!reportId} />
      </Card>
    </div>
  );
}

export default ReportDownloadPage;
