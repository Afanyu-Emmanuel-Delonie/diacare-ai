import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import PatientSelect from '../../../components/common/PatientSelect.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { getCurrentPatient } from '../../../services/patientService.js';
import { getClinicalReport } from '../../../services/reportService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import ClinicalReportView from './ClinicalReportView.jsx';

const audienceLabels = {
  [ROLES.ADMIN]: 'Administrator Report',
  [ROLES.DOCTOR]: 'Doctor Patient Report',
  [ROLES.NURSE]: 'Nurse Patient Report',
  [ROLES.CAREGIVER]: 'Caregiver Patient Report',
  [ROLES.PATIENT]: 'My Health Report'
};

function ReportsPage() {
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const isPatient = userRole === ROLES.PATIENT;

  const [patientId, setPatientId] = useState(isPatient ? '' : searchParams.get('patientId') || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(isPatient || Boolean(patientId));
  const [resolvingSelf, setResolvingSelf] = useState(isPatient);
  const [error, setError] = useState('');

  const loadReport = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getClinicalReport(id, audienceLabels[userRole] || 'Health Report');
      setReport(data);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to load the report.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPatient && patientId) {
      loadReport(patientId);
    }
  }, []);

  useEffect(() => {
    if (!isPatient) return;
    getCurrentPatient()
      .then((response) => {
        setPatientId(String(response.data.id));
        return loadReport(response.data.id);
      })
      .catch(() => {
        setError('No patient profile is linked to your account.');
      })
      .finally(() => setResolvingSelf(false));
  }, [isPatient]);

  const handlePatientChange = (event) => {
    const value = event.target.value;
    setPatientId(value);
    if (value) loadReport(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">Reports</h1>
          <p className="mt-1 text-sm text-[#334155]/80">
            {isPatient
              ? 'Your personal health report, generated from your live records.'
              : 'Select a patient to generate a clinical report from live records.'}
          </p>
        </div>
        {report && (
          <Button variant="secondary" onClick={() => window.print()}>
            Printable view
          </Button>
        )}
      </div>

      {!isPatient && (
        <Card>
          <PatientSelect
            name="patientId"
            label="Patient"
            value={patientId}
            onChange={handlePatientChange}
          />
        </Card>
      )}

      {resolvingSelf && <LoadingSpinner label="Loading your profile..." />}
      {!resolvingSelf && loading && <LoadingSpinner label="Loading report..." />}
      {!resolvingSelf && !loading && error && <EmptyState title="Report could not be loaded" message={error} />}
      {!resolvingSelf && !loading && !error && !patientId && (
        <EmptyState title="Select a patient" message="Choose a patient above to generate their report." />
      )}
      {!resolvingSelf && !loading && !error && patientId && <ClinicalReportView report={report} />}
    </div>
  );
}

export default ReportsPage;
