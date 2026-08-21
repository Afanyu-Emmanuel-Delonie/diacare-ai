import Button from '../../../components/common/Button.jsx';

function ReportDownloadActions({ reportId, onDownload, disabled = false }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="secondary" disabled={disabled} onClick={() => onDownload(reportId, 'PDF')}>
        PDF
      </Button>
      <Button variant="secondary" disabled={disabled} onClick={() => onDownload(reportId, 'EXCEL')}>
        Excel
      </Button>
      <Button variant="secondary" disabled={disabled} onClick={() => onDownload(reportId, 'CSV')}>
        CSV
      </Button>
      <Button variant="secondary" disabled={disabled} onClick={() => onDownload(reportId, 'JSON')}>
        JSON
      </Button>
      <Button variant="secondary" onClick={() => window.print()}>
        Printable view
      </Button>
    </div>
  );
}

export default ReportDownloadActions;
