import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { deleteMedication, getMedication, updateMedicationAdherence } from '../../../services/medicationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import MedicationSafetyDisclaimer from './MedicationSafetyDisclaimer.jsx';

function MedicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canEdit = userRole === ROLES.DOCTOR;
  const canMarkAdherence = userRole === ROLES.PATIENT;

  const loadMedication = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMedication(id);
      setMedication(response.data);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load medication.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedication();
  }, [id]);

  const markAdherence = async (adherenceStatus) => {
    try {
      await updateMedicationAdherence(id, { adherenceStatus });
      showToast({ type: 'success', message: `Medication marked as ${adherenceStatus.toLowerCase()}.` });
      await loadMedication();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to update adherence.');
      showToast({ type: 'error', message });
    }
  };

  const handleArchive = async () => {
    try {
      await deleteMedication(id);
      showToast({ type: 'success', message: 'Medication archived successfully where allowed.' });
      navigate('/dashboard/medications');
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to archive medication.');
      showToast({ type: 'error', message });
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  if (!medication) {
    return <EmptyState title="Medication could not be loaded" message={error || 'Medication was not found.'} />;
  }

  return (
    <div className="space-y-6">
      <MedicationSafetyDisclaimer />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant={medication.missedMedicationAlert ? 'critical' : 'info'}>{medication.missedMedicationAlert ? 'MISSED ALERT' : 'MEDICATION'}</Badge>
          <h1 className="mt-3 text-2xl font-bold text-[#334155]">{medication.medicationName}</h1>
          <p className="mt-1 text-[#334155]/80">{medication.patientName || `Patient #${medication.patientId}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <>
              <Link to={`/dashboard/medications/${medication.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Button variant="critical" onClick={() => setConfirmOpen(true)}>Archive</Button>
            </>
          )}
          {canMarkAdherence && (
            <>
              <Button variant="success" onClick={() => markAdherence('TAKEN')}>Mark taken</Button>
              <Button variant="critical" onClick={() => markAdherence('MISSED')}>Mark missed</Button>
            </>
          )}
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <DetailCard title="Doctor Prescribed Dose" value={medication.doctorPrescribedDose} />
        <DetailCard title="Medication Schedule" value={medication.medicationSchedule || medication.typicalTiming || 'No schedule recorded.'} />
        <DetailCard title="Reminder Schedule" value={medication.reminderSchedule || 'No reminder schedule recorded.'} />
        <DetailCard title="Adherence Tracking" value={`${medication.adherenceStatus || 'PENDING'}${medication.lastAdherenceUpdatedAt ? ` - updated ${formatDate(medication.lastAdherenceUpdatedAt)}` : ''}`} />
        <DetailCard title="Missed Medication Alerts" value={medication.missedMedicationAlert ? 'Missed medication alert is active.' : 'No missed medication alert.'} />
        <DetailCard title="Medication History" value={`Started: ${medication.startDate || 'Not set'}\nEnded: ${medication.endDate || 'Active medication'}`} />
        <DetailCard title="Purpose" value={medication.purpose || 'No purpose recorded.'} />
        <DetailCard title="Missed Dose Guidance" value={medication.missedDoseGuidance || 'No guidance recorded. Contact a healthcare professional for advice.'} />
        <DetailCard title="Warnings" value={medication.warnings || 'No warnings recorded.'} />
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Archive medication"
        message="Archive this medication record where allowed? Clinical medication history should be preserved for safety and audit review."
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function DetailCard({ title, value }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#334155]/85">{value}</p>
    </Card>
  );
}

function formatDate(value) {
  return value ? value.replace('T', ' ').slice(0, 16) : '';
}

export default MedicationDetails;
