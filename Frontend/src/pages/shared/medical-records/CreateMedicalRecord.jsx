import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useToast from '../../../hooks/useToast.js';
import { buildMedicalRecordPayload, createMedicalRecord, getMedicalRecordInitialFormData } from '../../../services/medicalRecordService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import MedicalRecordForm from './MedicalRecordForm.jsx';

function CreateMedicalRecord() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    ...getMedicalRecordInitialFormData(),
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
      const response = await createMedicalRecord(buildMedicalRecordPayload(formData));
      showToast({ type: 'success', message: 'Medical record created successfully.' });
      navigate(`/dashboard/medical-records/${response.data.id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to create medical record.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MedicalRecordForm
      title="Add Medical Record"
      description="Create a clinical record for an assigned patient."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Create record"
      error={error}
      patientIdLocked={Boolean(searchParams.get('patientId'))}
    />
  );
}

export default CreateMedicalRecord;
