import NotificationModulePage from './NotificationModulePage.jsx';

function AppointmentReminders() {
  return (
    <NotificationModulePage
      title="Appointment Reminders"
      eyebrow="Appointments"
      description="View appointment reminder notifications for allowed patient records."
      fixedCategory="APPOINTMENT_REMINDER"
    />
  );
}

export default AppointmentReminders;
