import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAppointment, updateAppointment } from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import AppointmentForm from './AppointmentForm.jsx';
import { toPayload } from './CreateAppointment.jsx';

function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAppointment(id)
      .then((response) => {
        const appointment = response.data;
        setFormData({
          patientId: appointment.patientId || '',
          doctorId: appointment.doctorId || '',
          nurseId: appointment.nurseId || '',
          scheduledAt: appointment.scheduledAt?.slice(0, 16) || '',
          appointmentType: appointment.appointmentType || '',
          reason: appointment.reason || '',
          location: appointment.location || '',
          notes: appointment.notes || '',
          reminderAt: appointment.reminderAt?.slice(0, 16) || '',
          status: appointment.status || 'UPCOMING'
        });
      })
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load appointment.');
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
      await updateAppointment(id, toPayload(formData));
      showToast({ type: 'success', message: 'Appointment updated successfully.' });
      navigate(`/dashboard/appointments/${id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to update appointment.');
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
    return <EmptyState title="Appointment could not be loaded" message={error || 'Appointment was not found.'} />;
  }

  return (
    <AppointmentForm
      title="Reschedule Appointment"
      description="Update appointment time, reminder, status, and care details."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Save appointment"
      error={error}
      patientIdLocked
    />
  );
}

export default EditAppointment;
