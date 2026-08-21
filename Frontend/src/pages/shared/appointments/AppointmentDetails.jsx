import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MdArrowBack,
  MdCalendarMonth,
  MdCancel,
  MdEditCalendar,
  MdEventAvailable,
  MdEventBusy,
  MdLocalHospital,
  MdMedicalServices,
  MdNoteAlt,
  MdNotifications,
  MdPerson,
  MdPlace,
} from 'react-icons/md';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { cancelAppointment, getAppointment, updateAppointmentStatus } from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

function AppointmentDetails() {
  const { id } = useParams();
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
    return <LoadingSpinner label="Loading appointment..." />;
  }

  if (!appointment) {
    return <EmptyState title="Appointment could not be loaded" message={error || 'Appointment was not found.'} />;
  }

  const patientLabel = appointment.patientName || `Patient #${appointment.patientId}`;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/appointments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
        <MdArrowBack size={16} /> Back to appointments
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#334155]">{appointment.appointmentType || 'Appointment'}</h1>
            <StatusBadge status={appointment.status} />
          </div>
          <p className="mt-1 text-[#334155]/70">{patientLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && (
            <>
              <Link to={`/dashboard/appointments/${appointment.id}/edit`}>
                <Button variant="secondary" className="flex items-center gap-1.5">
                  <MdEditCalendar size={16} /> Reschedule
                </Button>
              </Link>
              <Button variant="success" className="flex items-center gap-1.5" onClick={() => updateStatus('COMPLETED')}>
                <MdEventAvailable size={16} /> Complete
              </Button>
              <Button variant="warning" className="flex items-center gap-1.5" onClick={() => updateStatus('MISSED')}>
                <MdEventBusy size={16} /> Missed
              </Button>
            </>
          )}
          {appointment.status !== 'CANCELLED' && (
            <Button variant="critical" className="flex items-center gap-1.5" onClick={() => setCancelDialogOpen(true)}>
              <MdCancel size={16} /> Cancel
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem icon={MdPerson} label="Patient" value={patientLabel} />
          <DetailItem icon={MdLocalHospital} label="Doctor" value={appointment.doctorName || 'Not yet assigned'} />
          <DetailItem icon={MdCalendarMonth} label="Date and time" value={formatDate(appointment.scheduledAt)} />
          <DetailItem icon={MdPlace} label="Location" value={appointment.location || 'Not specified'} />
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard icon={MdMedicalServices} color="#2563EB" title="Reason for visit" value={appointment.reason} emptyText="No reason provided." />
        <InfoCard icon={MdNotifications} color="#F59E0B" title="Reminder" value={formatDate(appointment.reminderAt)} emptyText="No reminder scheduled." />
        <InfoCard icon={MdNoteAlt} color="#7C3AED" title="Notes" value={appointment.notes} emptyText="No notes available." className="md:col-span-2" />
      </section>

      <p className="text-xs text-[#94A3B8]">
        Created {formatDate(appointment.createdAt)}
        {appointment.updatedAt && appointment.updatedAt !== appointment.createdAt ? ` · Updated ${formatDate(appointment.updatedAt)}` : ''}
      </p>

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

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9]">
        <Icon size={16} className="text-[#64748B]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[#334155]">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, color, title, value, emptyText = 'No data available.', className = '' }) {
  return (
    <Card className={className}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}16` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#334155]/85">{value || emptyText}</p>
    </Card>
  );
}

function formatDate(value) {
  if (!value) {
    return 'Not set';
  }
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default AppointmentDetails;
