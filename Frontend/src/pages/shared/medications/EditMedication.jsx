import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useToast from '../../../hooks/useToast.js';
import { getMedication, updateMedication } from '../../../services/medicationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import MedicationForm from './MedicationForm.jsx';
import { toPayload } from './CreateMedication.jsx';

function EditMedication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMedication(id)
      .then((response) => {
        const medication = response.data;
        setFormData({
          patientId: medication.patientId || '',
          medicationName: medication.medicationName || '',
          medicationClass: medication.medicationClass || '',
          purpose: medication.purpose || '',
          suitableDiabetesType: medication.suitableDiabetesType || '',
          medicationSchedule: medication.medicationSchedule || '',
          typicalTiming: medication.typicalTiming || '',
          howToUseGeneralInfo: medication.howToUseGeneralInfo || '',
          commonSideEffects: medication.commonSideEffects || '',
          storageInstructions: medication.storageInstructions || '',
          missedDoseGuidance: medication.missedDoseGuidance || '',
          warnings: medication.warnings || '',
          doctorPrescribedDose: medication.doctorPrescribedDose || '',
          reminderSchedule: medication.reminderSchedule || '',
          adherenceStatus: medication.adherenceStatus || 'PENDING',
          missedMedicationAlert: medication.missedMedicationAlert || false,
          startDate: medication.startDate || '',
          endDate: medication.endDate || ''
        });
      })
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load medication.');
        setError(message);
        showToast({ type: 'error', message });
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await updateMedication(id, toPayload(formData));
      showToast({ type: 'success', message: 'Medication updated successfully.' });
      navigate(`/dashboard/medications/${id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to update medication.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  if (!formData) {
    return <EmptyState title="Medication could not be loaded" message={error || 'Medication was not found.'} />;
  }

  return (
    <MedicationForm
      title="Update Medication"
      description="Update prescribed dose, schedule, reminders, and safety information."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Save changes"
      error={error}
      patientIdLocked
    />
  );
}

export default EditMedication;
