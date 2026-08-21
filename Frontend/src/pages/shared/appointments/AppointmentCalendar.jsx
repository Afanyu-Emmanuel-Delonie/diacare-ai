import Card from '../../../components/common/Card.jsx';
import Badge from '../../../components/common/Badge.jsx';

function AppointmentCalendar({ appointments }) {
  const grouped = appointments.reduce((days, appointment) => {
    const date = appointment.scheduledAt?.slice(0, 10) || 'No date';
    return { ...days, [date]: [...(days[date] || []), appointment] };
  }, {});

  return (
    <Card>
      <h2 className="text-base font-semibold text-[#334155]">Calendar View</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="rounded-lg border border-[#334155]/15 bg-[#FFFFFF] p-4">
            <p className="text-sm font-bold text-[#334155]">{date}</p>
            <div className="mt-3 space-y-2">
              {items.map((appointment) => (
                <div key={appointment.id} className="rounded-md bg-[#2563EB]/10 p-3 text-sm text-[#334155]">
                  <p className="font-semibold">{appointment.patientName || `Patient #${appointment.patientId}`}</p>
                  <p className="mt-1">{appointment.scheduledAt?.slice(11, 16)} - {appointment.appointmentType || 'Appointment'}</p>
                  <Badge variant={statusVariant(appointment.status)}>{appointment.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function statusVariant(status) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED' || status === 'MISSED') return 'critical';
  return 'info';
}

export default AppointmentCalendar;
