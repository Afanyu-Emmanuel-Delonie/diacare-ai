import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { cancelAppointment, getAppointment, updateAppointmentStatus } from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const canManage = [ROLES.DOCTOR, ROLES.NURSE].includes(userRole);

  const loadAppointment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAppointment(id);
      setAppointment(response.data);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load appointment.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      await updateAppointmentStatus(id, { status });
      showToast({ type: 'success', message: `Appointment marked ${status.toLowerCase()}.` });
      await loadAppointment();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to update appointment.');
      showToast({ type: 'error', message });
    }
  };

  const cancel = async () => {
    try {
      await cancelAppointment(id);
      showToast({ type: 'success', message: 'Appointment cancelled.' });
      setCancelDialogOpen(false);
      await loadAppointment();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to cancel appointment.');
      showToast({ type: 'error', message });
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  if (!appointment) {
    return <EmptyState title="Appointment could not be loaded" message={error || 'Appointment was not found.'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant={statusVariant(appointment.status)}>{appointment.status}</Badge>
          <h1 className="mt-3 text-2xl font-bold text-[#334155]">{appointment.appointmentType || 'Appointment'}</h1>
          <p className="mt-1 text-[#334155]/80">{appointment.patientName || `Patient #${appointment.patientId}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && (
            <>
              <Link to={`/dashboard/appointments/${appointment.id}/edit`}>
                <Button variant="secondary">Reschedule</Button>
              </Link>
              <Button variant="success" onClick={() => updateStatus('COMPLETED')}>Complete</Button>
              <Button variant="warning" onClick={() => updateStatus('MISSED')}>Missed</Button>
            </>
          )}
          {appointment.status !== 'CANCELLED' && <Button variant="critical" onClick={() => setCancelDialogOpen(true)}>Cancel</Button>}
          <Button variant="secondary" onClick={() => navigate('/dashboard/appointments')}>Back</Button>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <DetailCard title="Patient" value={appointment.patientName || `Patient #${appointment.patientId}`} />
        <DetailCard title="Status" value={appointment.status} />
        <DetailCard title="Doctor" value={appointment.doctorName || 'Not available from backend.'} />
        <DetailCard title="Nurse" value={appointment.nurseName || 'Not available from backend.'} />
        <DetailCard title="Appointment Date and Time" value={formatDate(appointment.scheduledAt)} />
        <DetailCard title="Reminder Schedule" value={formatDate(appointment.reminderAt)} />
        <DetailCard title="Location or Consultation Mode" value={appointment.location || 'Not specified'} />
        <DetailCard title="Reason" value={appointment.reason || 'No reason provided.'} />
        <DetailCard title="Notes" value={appointment.notes || 'No notes available.'} />
        <DetailCard title="Created By" value={appointment.createdBy || 'Not available from backend.'} />
        <DetailCard title="Created Date and Time" value={formatDate(appointment.createdAt)} />
        <DetailCard title="Updated Date and Time" value={formatDate(appointment.updatedAt)} />
      </section>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel appointment"
        message="Cancel this appointment? This action will update the appointment status."
        confirmLabel="Cancel appointment"
        onConfirm={cancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </div>
  );
}

function DetailCard({ title, value }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
      {title === 'Status' ? (
        <div className="mt-3">
          <StatusBadge status={value} />
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#334155]/85">{value}</p>
      )}
    </Card>
  );
}

function statusVariant(status) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED' || status === 'MISSED') return 'critical';
  return 'info';
}

function formatDate(value) {
  return value ? value.replace('T', ' ').slice(0, 16) : 'Not set';
}

export default AppointmentDetails;
