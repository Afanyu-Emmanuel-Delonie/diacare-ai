import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdArrowForward,
  MdCalendarMonth,
  MdCheckCircle,
  MdEmergency,
  MdMedication,
  MdMessage,
  MdMonitorHeart,
  MdNotifications,
  MdPeople,
  MdStickyNote2,
  MdWarning,
} from 'react-icons/md';
import EmptyState from '../../components/common/EmptyState.jsx';
import MiniChart from '../../components/common/MiniChart.jsx';
import useAuth from '../../hooks/useAuth.js';
import { getDashboardData } from '../../services/dashboardService.js';

const EMPTY_DATA = {
  stats: {},
  assignedPatientSummary: [],
  reminderCompletionTrend: [],
  careNotesList: [],
  caregiverAlerts: [],
  sections: {},
};

function collection(data, key) {
  const value = data[key] || data.sections?.[key];
  return Array.isArray(value) ? value : [];
}

function value(data, key) {
  return data.stats?.[key] ?? data[key] ?? 0;
}

function displayDate(input) {
  if (!input) return 'Not scheduled';
  const date = new Date(input);
  return Number.isNaN(date.getTime())
    ? String(input)
    : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function MetricCard({ icon: Icon, label, value: metricValue, helper, color, urgent = false }) {
  return (
    <div className={`flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm ${urgent ? 'border-[#DC2626]/25' : 'border-[#334155]/10'}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">{label}</p>
        <p className="mt-1 text-2xl font-bold" style={{ color: urgent && Number(metricValue) > 0 ? '#DC2626' : '#1E293B' }}>
          {metricValue}
        </p>
        <p className="mt-0.5 text-xs text-[#94A3B8]">{helper}</p>
      </div>
    </div>
  );
}

function Section({ title, description, action, to, children }) {
  return (
    <section className="rounded-xl border border-[#334155]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1E293B]">{title}</h2>
          {description && <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>}
        </div>
        {action && (
          <Link to={to} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline">
            {action} <MdArrowForward size={13} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function QuickAction({ icon: Icon, label, description, to, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-[#334155]/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1E293B]">{label}</p>
        <p className="truncate text-xs text-[#94A3B8]">{description}</p>
      </div>
      <MdArrowForward className="ml-auto shrink-0 text-[#CBD5E1] transition-colors group-hover:text-[#2563EB]" />
    </Link>
  );
}

function CaregiverDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY_DATA);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    getDashboardData('CAREGIVER')
      .then((response) => {
        if (active) {
          setData({ ...EMPTY_DATA, ...response });
          setStatus('ready');
        }
      })
      .catch(() => active && setStatus('error'));
    return () => { active = false; };
  }, []);

  const patients = collection(data, 'assignedPatientSummary');
  const trend = collection(data, 'reminderCompletionTrend');
  const notes = collection(data, 'careNotesList');
  const alerts = collection(data, 'caregiverAlerts');
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Caregiver';

  if (status === 'loading') {
    return (
      <div className="space-y-5">
        <div className="h-14 max-w-sm animate-pulse rounded-xl bg-[#E2E8F0]" />
        <LoadingDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D97706]">Caregiver workspace</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1E293B]">Good day, {firstName}</h1>
          <p className="mt-1 text-sm text-[#64748B]">Here is what needs your attention across your assigned patients.</p>
        </div>
        <Link
          to="/dashboard/notifications"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          <MdNotifications size={18} /> Review notifications
        </Link>
      </header>

      {status === 'error' && (
        <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Live dashboard data could not be loaded. Some values may be unavailable.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={MdPeople} label="Assigned Patients" value={value(data, 'assignedPatients')} helper="People currently in your care" color="#2563EB" />
        <MetricCard icon={MdMedication} label="Medication Reminders" value={value(data, 'medicationReminders')} helper="Reminders requiring support" color="#F59E0B" />
        <MetricCard icon={MdCalendarMonth} label="Appointment Reminders" value={value(data, 'appointmentReminders')} helper="Upcoming scheduled visits" color="#0EA5E9" />
        <MetricCard icon={MdStickyNote2} label="Care Notes" value={value(data, 'careNotes')} helper="Notes recorded for care continuity" color="#8B5CF6" />
        <MetricCard icon={MdWarning} label="Abnormal Alerts" value={value(data, 'abnormalAlerts')} helper="Readings that need attention" color="#F59E0B" urgent />
        <MetricCard icon={MdEmergency} label="Emergency Alerts" value={value(data, 'emergencyAlerts')} helper="Urgent alerts to review now" color="#DC2626" urgent />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Section title="Reminder Completion" description="Medication and appointment support completed over time." action="View medications" to="/dashboard/medications">
          {trend.length ? (
            <div className="h-64">
              <MiniChart data={trend} title="Reminder completion" valueSuffix="%" />
            </div>
          ) : (
            <EmptyState title="No reminder trend yet" message="Completion activity will appear here as reminders are handled." />
          )}
        </Section>

        <Section title="Priority Alerts" description="Abnormal and emergency events from assigned patients." action="View all alerts" to="/dashboard/ai-risk/abnormal-alerts">
          {alerts.length ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => {
                const urgent = /emergency|critical|high/i.test(alert.level || alert.status || alert.type || '');
                return (
                  <div key={alert.id || index} className={`rounded-lg border px-3 py-3 ${urgent ? 'border-[#DC2626]/20 bg-[#FEF2F2]' : 'border-[#F59E0B]/20 bg-[#FFFBEB]'}`}>
                    <div className="flex items-start gap-2">
                      {urgent ? <MdEmergency className="mt-0.5 shrink-0 text-[#DC2626]" /> : <MdWarning className="mt-0.5 shrink-0 text-[#D97706]" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E293B]">{alert.title || alert.type || 'Patient alert'}</p>
                        <p className="mt-0.5 text-xs text-[#64748B]">{alert.message || alert.description || 'Review this alert for more information.'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <MdCheckCircle size={34} className="text-[#10B981]" />
              <p className="mt-2 text-sm font-semibold text-[#1E293B]">No active alerts</p>
              <p className="mt-1 text-xs text-[#94A3B8]">Your assigned patients have no alerts requiring attention.</p>
            </div>
          )}
        </Section>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction icon={MdPeople} label="My Patients" description="Open assigned patient profiles" to="/dashboard/patients" color="#2563EB" />
          <QuickAction icon={MdMonitorHeart} label="Health Monitoring" description="Review recent health readings" to="/dashboard/monitoring" color="#10B981" />
          <QuickAction icon={MdCalendarMonth} label="Appointments" description="Check upcoming patient visits" to="/dashboard/appointments" color="#0EA5E9" />
          <QuickAction icon={MdMessage} label="Messages" description="Contact the patient care team" to="/dashboard/messages" color="#8B5CF6" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Section title="Assigned Patients" description="A concise view of the people currently assigned to you." action="View all patients" to="/dashboard/patients">
          {patients.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {patients.slice(0, 4).map((patient, index) => (
                <Link key={patient.id || index} to={patient.id ? `/dashboard/patients/${patient.id}` : '/dashboard/patients'} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 hover:border-[#2563EB]/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1E293B]">{patient.patientName || patient.name || 'Assigned patient'}</p>
                      <p className="mt-1 text-xs text-[#64748B]">Next reminder: {patient.nextReminder || 'None'}</p>
                      <p className="mt-1 text-xs text-[#64748B]">Appointment: {displayDate(patient.nextAppointment)}</p>
                    </div>
                    <MdArrowForward className="shrink-0 text-[#94A3B8]" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No assigned patients" message="Assigned patient summaries will appear here." />
          )}
        </Section>

        <Section title="Recent Care Notes" description="Latest care updates for continuity and follow-up.">
          {notes.length ? (
            <div className="divide-y divide-[#F1F5F9]">
              {notes.slice(0, 5).map((note, index) => (
                <div key={note.id || index} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#1E293B]">{note.title || note.patientName || note.action || 'Care update'}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{note.description || note.details || note.message || 'No additional details.'}</p>
                  {(note.time || note.dateTime || note.createdAt) && <p className="mt-1 text-[11px] text-[#94A3B8]">{displayDate(note.time || note.dateTime || note.createdAt)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent care notes" message="Recent care updates will appear here." />
          )}
        </Section>
      </section>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 rounded-xl bg-[#E2E8F0]" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-xl bg-[#E2E8F0]" />
        <div className="h-72 rounded-xl bg-[#E2E8F0]" />
      </div>
    </div>
  );
}

export default CaregiverDashboard;
