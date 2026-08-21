import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { createAppointment } from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import AppointmentForm from './AppointmentForm.jsx';

function defaultDateTime() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16);
}

function CreateAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userRole, user } = useAuth();
  const { showToast } = useToast();
  const isPatient = userRole === ROLES.PATIENT;
  const [formData, setFormData] = useState({
    patientId: isPatient ? String(user?.id || '') : (searchParams.get('patientId') || ''),
    doctorId: '',
    nurseId: '',
    scheduledAt: defaultDateTime(),
    appointmentType: '',
    reason: '',
    location: '',
    notes: '',
    reminderAt: '',
    status: 'UPCOMING'
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
      const response = await createAppointment(toPayload(formData));
      showToast({ type: 'success', message: 'Appointment created successfully.' });
      navigate(`/dashboard/appointments/${response.data.id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to create appointment.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppointmentForm
      title={userRole === ROLES.PATIENT ? 'Request Appointment' : 'Create Appointment'}
      description="Book an appointment and set an optional reminder."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Create appointment"
      error={error}
      patientIdLocked={Boolean(searchParams.get('patientId'))}
      statusReadOnly={userRole === ROLES.PATIENT}
    />
  );
}

export function toPayload(formData) {
  return {
    patientId: Number(formData.patientId),
    scheduledAt: formData.scheduledAt,
    appointmentType: formData.appointmentType || null,
    reason: formData.reason || null,
    location: formData.location || null,
    reminderAt: formData.reminderAt || null,
    status: formData.status || 'UPCOMING'
  };
}

export default CreateAppointment;
