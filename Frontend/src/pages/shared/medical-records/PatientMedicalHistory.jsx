import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import Input from '../../../components/common/Input.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import Table, { RowActions } from '../../../components/common/Table.jsx';
import useToast from '../../../hooks/useToast.js';
import { getMedicalRecordsByPatientEmail } from '../../../services/medicalRecordService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

function PatientMedicalHistory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPatientEmail = searchParams.get('patientEmail') || '';
  const { showToast } = useToast();
  const [patientEmail, setPatientEmail] = useState(initialPatientEmail);
  const [loadedPatientEmail, setLoadedPatientEmail] = useState(initialPatientEmail);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialPatientEmail));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialPatientEmail) {
      return;
    }

    loadHistory(initialPatientEmail);
  }, [initialPatientEmail]);

  const summary = useMemo(() => {
    const diagnoses = records.map((record) => record.diagnosis).filter(Boolean);
    const allergies = records.map((record) => record.allergies).filter(Boolean);
    const treatmentPlans = records.map((record) => record.treatmentPlan).filter(Boolean);
    const doctorNotes = records.map((record) => record.doctorNotes).filter(Boolean);

    return {
      diagnoses,
      allergies,
      treatmentPlans,
      doctorNotes
    };
  }, [records]);

  const loadHistory = async (email) => {
    if (!email) {
      setError('Enter a patient email to view medical history.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getMedicalRecordsByPatientEmail(email);
      setRecords(Array.isArray(response.data) ? response.data : []);
      setLoadedPatientEmail(email);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load patient medical history.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'recordDateTime', header: 'Date', render: (record) => formatDateTime(record.recordDateTime || record.recordDate) },
    { key: 'diagnosis', header: 'Diagnosis' },
    { key: 'doctorName', header: 'Doctor', render: (record) => record.doctorName || 'Not available' },
    { key: 'allergies', header: 'Allergies', render: (record) => record.allergies || 'No allergies recorded' },
    { key: 'treatmentPlan', header: 'Treatment Plan', render: (record) => record.treatmentPlan || 'No treatment plan recorded' },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (record) => (
        <RowActions actions={[
          { label: 'View details', onClick: () => navigate(`/dashboard/medical-records/${record.id}`) },
        ]} />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">Patient Medical History</h1>
        <p className="mt-1 text-[#334155]/80">View diagnosis history, allergies, treatment plan summaries, and doctor notes for an allowed patient.</p>
      </div>

      <Card>
        <form
          className="flex flex-col gap-3 md:flex-row md:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            loadHistory(patientEmail.trim().toLowerCase());
          }}
        >
          <Input id="patientHistoryEmail" label="Patient email" type="email" value={patientEmail} onChange={(event) => setPatientEmail(event.target.value)} placeholder="patient@example.com" required />
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'View history'}
          </Button>
        </form>
      </Card>

      {loading && <LoadingSpinner label="Loading patient medical history..." />}
      {!loading && error && <EmptyState title="Medical history could not be loaded" message={error} />}
      {!loading && !error && loadedPatientEmail && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <HistorySummary title="Diagnosis History" items={summary.diagnoses} />
            <HistorySummary title="Allergies" items={summary.allergies} emptyText="No allergies recorded." />
            <HistorySummary title="Treatment Plans" items={summary.treatmentPlans} />
            <HistorySummary title="Doctor Notes" items={summary.doctorNotes} emptyText="No doctor notes available for this role." />
          </section>

          <Table columns={columns} data={records} emptyMessage="No medical records available for this patient." />
        </>
      )}
      {!loading && !error && !loadedPatientEmail && <EmptyState title="Search for a patient" message="Enter a patient email to view medical history." />}
    </div>
  );
}

function HistorySummary({ title, items, emptyText = 'No data available for this section.' }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm text-[#334155]/85">
          {items.slice(0, 4).map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#334155]/75">{emptyText}</p>
      )}
    </Card>
  );
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString();
}

export default PatientMedicalHistory;
