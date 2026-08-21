import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../../../hooks/useToast.js';
import { buildPatientPayload, createPatient, getPatientInitialFormData } from '../../../services/patientService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import PatientForm from './PatientForm.jsx';

const initialForm = {
  ...getPatientInitialFormData(),
  patientId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  diabetesType: 'TYPE_2',
  diagnosisDate: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  status: 'ACTIVE',
  doctorId: '',
  nurseId: '',
  caregiverId: ''
};

function CreatePatient() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialForm);
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
      const response = await createPatient(buildPatientPayload(formData));
      showToast({ type: 'success', message: 'Patient created successfully.' });
      navigate(`/dashboard/patients/${response.data.id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to create patient.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PatientForm
      title="Create Patient"
      description="Add a patient profile and assign care team members by ID."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Create patient"
      error={error}
    />
  );
}

export default CreatePatient;
