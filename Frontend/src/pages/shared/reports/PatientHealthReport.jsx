import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { getPatientHealthReport } from '../../../services/reportService.js';
import ClinicalReportView from './ClinicalReportView.jsx';

function PatientHealthReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadReport() {
      try {
        setReport(await getPatientHealthReport());
      } catch {
        showToast({ type: 'error', message: 'Unable to load your health report.' });
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">My Health Report</h1>
          <p className="mt-2 text-sm text-[#334155]/80">Your own clinical report is loaded using your JWT account.</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          Printable view
        </Button>
      </div>

      {loading ? <LoadingSpinner label="Loading your report..." /> : <ClinicalReportView report={report} />}
    </div>
  );
}

export default PatientHealthReport;
