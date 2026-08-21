import { useState } from 'react';
import Button from '../../../components/common/Button.jsx';
import useToast from '../../../hooks/useToast.js';
import { downloadReportFile } from '../../../services/reportService.js';

const formats = ['JSON', 'PDF', 'EXCEL', 'CSV'];

function ReportDownloadActions({ reportId }) {
  const [downloadingFormat, setDownloadingFormat] = useState('');
  const { showToast } = useToast();

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    try {
      await downloadReportFile(reportId, format);
    } catch {
      showToast({ type: 'error', message: `Failed to download report as ${format}.` });
    } finally {
      setDownloadingFormat('');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {formats.map((format) => (
        <Button
          key={format}
          type="button"
          variant="secondary"
          disabled={Boolean(downloadingFormat) || !reportId}
          onClick={() => handleDownload(format)}
        >
          {downloadingFormat === format ? 'Downloading...' : format}
        </Button>
      ))}
    </div>
  );
}

export default ReportDownloadActions;
