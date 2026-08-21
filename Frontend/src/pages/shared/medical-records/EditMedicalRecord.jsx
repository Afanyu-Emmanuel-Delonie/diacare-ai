import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { buildMedicalRecordPayload, getMedicalRecord, getMedicalRecordInitialFormData, updateMedicalRecord } from '../../../services/medicalRecordService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import MedicalRecordForm from './MedicalRecordForm.jsx';

function EditMedicalRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMedicalRecord(id)
      .then((response) => {
        setFormData(getMedicalRecordInitialFormData(response.data));
      })
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load medical record.');
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
      await updateMedicalRecord(id, buildMedicalRecordPayload(formData));
      showToast({ type: 'success', message: 'Medical record updated successfully.' });
      navigate(`/dashboard/medical-records/${id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to update medical record.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading medical record..." />;
  }

  if (!formData) {
    return <EmptyState title="Medical record could not be loaded" message={error || 'Record was not found.'} />;
  }

  return (
    <MedicalRecordForm
      title="Update Medical Record"
      description="Update diagnosis, allergies, treatment plan, and clinical notes."
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

export default EditMedicalRecord;
