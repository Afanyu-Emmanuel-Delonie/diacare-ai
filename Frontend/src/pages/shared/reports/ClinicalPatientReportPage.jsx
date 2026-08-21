import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { getCaregiverPatientReport, getDoctorPatientReport, getNursePatientReport } from '../../../services/reportService.js';
import ClinicalReportView from './ClinicalReportView.jsx';

const loaders = {
  doctor: getDoctorPatientReport,
  nurse: getNursePatientReport,
  caregiver: getCaregiverPatientReport
};

const titles = {
  doctor: 'Doctor Patient Reports',
  nurse: 'Nurse Patient Reports',
  caregiver: 'Caregiver Patient Reports'
};

function ClinicalPatientReportPage({ audience }) {
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState(searchParams.get('patientId') || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function loadReport(event) {
    event.preventDefault();

    if (!patientId) {
      showToast({ type: 'warning', message: 'Enter a patient ID first.' });
      return;
    }

    setLoading(true);
    try {
      setReport(await loaders[audience](patientId));
    } catch {
      showToast({ type: 'error', message: 'Unable to load patient report. Check permissions and patient ID.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">{titles[audience]}</h1>
        <p className="mt-2 text-sm text-[#334155]/80">Only assigned patient reports are available for this role.</p>
      </div>

      <Card>
        <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={loadReport}>
          <div className="md:w-72">
            <Input
              label="Patient ID"
              id={`${audience}-patient-id`}
              type="number"
              min="1"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
            />
          </div>
          <Button type="submit">Load report</Button>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            Printable view
          </Button>
        </form>
      </Card>

      {loading ? <LoadingSpinner label="Loading clinical report..." /> : <ClinicalReportView report={report} />}
    </div>
  );
}

export default ClinicalPatientReportPage;
