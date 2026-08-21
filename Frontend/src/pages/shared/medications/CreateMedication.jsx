import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useToast from '../../../hooks/useToast.js';
import { createMedication } from '../../../services/medicationService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import MedicationForm from './MedicationForm.jsx';

const today = new Date().toISOString().slice(0, 10);

const initialForm = {
  patientId: '',
  medicationName: '',
  medicationClass: '',
  purpose: '',
  suitableDiabetesType: '',
  medicationSchedule: '',
  typicalTiming: '',
  howToUseGeneralInfo: '',
  commonSideEffects: '',
  storageInstructions: '',
  missedDoseGuidance: '',
  warnings: '',
  doctorPrescribedDose: '',
  reminderSchedule: '',
  adherenceStatus: 'PENDING',
  missedMedicationAlert: false,
  startDate: today,
  endDate: ''
};

function CreateMedication() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    ...initialForm,
    patientId: searchParams.get('patientId') || ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await createMedication(toPayload(formData));
      showToast({ type: 'success', message: 'Medication created successfully.' });
      navigate(`/dashboard/medications/${response.data.id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to create medication.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MedicationForm
      title="Add Medication"
      description="Create a prescribed medication record for an assigned patient."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Create medication"
      error={error}
      patientIdLocked={Boolean(searchParams.get('patientId'))}
    />
  );
}

export function toPayload(formData) {
  return {
    ...formData,
    patientId: Number(formData.patientId),
    endDate: formData.endDate || null
  };
}

export default CreateMedication;
