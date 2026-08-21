import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { buildPatientPayload, getPatient, getPatientInitialFormData, updatePatient } from '../../../services/patientService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import PatientForm from './PatientForm.jsx';

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPatient(id)
      .then((response) => {
        const patient = response.data;
        setFormData({
          ...getPatientInitialFormData(patient),
          patientId: patient.id || ''
        });
      })
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load patient.');
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
      await updatePatient(id, buildPatientPayload(formData));
      showToast({ type: 'success', message: 'Patient updated successfully.' });
      navigate(`/dashboard/patients/${id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to update patient.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading patient..." />;
  }

  if (!formData) {
    return <EmptyState title="Patient could not be loaded" message={error || 'Patient was not found.'} />;
  }

  return (
    <PatientForm
      title="Update Patient Profile"
      description="Edit patient contact, diabetes profile, emergency contact, and assigned care team."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Save changes"
      error={error}
    />
  );
}

export default EditPatient;
