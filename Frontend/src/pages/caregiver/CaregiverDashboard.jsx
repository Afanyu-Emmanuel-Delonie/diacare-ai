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
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import DashboardQuickAction from '../../components/dashboard/DashboardQuickAction.jsx';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton.jsx';
import DashboardStatCell from '../../components/dashboard/DashboardStatCell.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import MiniChart from '../../components/common/MiniChart.jsx';
import useAuth from '../../hooks/useAuth.js';
import { getDashboardData } from '../../services/dashboardService.js';
import { dashboardCollection, dashboardValue, displayDashboardDate } from '../../utils/dashboardData.js';

const EMPTY_DATA = {
  stats: {},
  assignedPatientSummary: [],
  reminderCompletionTrend: [],
  careNotesList: [],
  caregiverAlerts: [],
  sections: {},
};

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

  const patients = dashboardCollection(data, 'assignedPatientSummary');
  const trend = dashboardCollection(data, 'reminderCompletionTrend');
  const notes = dashboardCollection(data, 'careNotesList');
  const alerts = dashboardCollection(data, 'caregiverAlerts');
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Caregiver';
  const emergencyCount = Number(dashboardValue(data, 'emergencyAlerts')) || 0;

  if (status === 'loading') {
    return (
      <div className="space-y-5">
        <div className="h-14 max-w-sm animate-pulse rounded-xl bg-[#E2E8F0]" />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">Caregiver workspace</p>
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

      {emergencyCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MdEmergency size={22} className="mt-0.5 shrink-0 text-[#DC2626]" />
            <div>
              <p className="text-sm font-semibold text-[#991B1B]">
                {emergencyCount} emergency {emergencyCount === 1 ? 'alert needs' : 'alerts need'} your attention now
              </p>
              <p className="mt-0.5 text-xs text-[#B91C1C]">Review these before anything else on this page.</p>
            </div>
          </div>
          <Link
            to="/dashboard/ai-risk/abnormal-alerts"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B91C1C]"
          >
            Review now <MdArrowForward size={14} />
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCell icon={MdPeople} label="Assigned Patients" value={dashboardValue(data, 'assignedPatients')} helper="People currently in your care" color="#2563EB" />
        <DashboardStatCell icon={MdMedication} label="Medication Reminders" value={dashboardValue(data, 'medicationReminders')} helper="Reminders requiring support" color="#16A34A" />
        <DashboardStatCell icon={MdCalendarMonth} label="Appointment Reminders" value={dashboardValue(data, 'appointmentReminders')} helper="Upcoming scheduled visits" color="#0EA5E9" />
        <DashboardStatCell icon={MdStickyNote2} label="Care Notes" value={dashboardValue(data, 'careNotes')} helper="Notes recorded for care continuity" color="#64748B" />
        <DashboardStatCell icon={MdWarning} label="Abnormal Alerts" value={dashboardValue(data, 'abnormalAlerts')} helper="Readings that need attention" color="#D97706" urgent />
        <DashboardStatCell icon={MdEmergency} label="Emergency Alerts" value={dashboardValue(data, 'emergencyAlerts')} helper="Urgent alerts to review now" color="#DC2626" urgent />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <DashboardPanel title="Priority Alerts" description="Abnormal and emergency events from assigned patients." action="View all alerts" to="/dashboard/ai-risk/abnormal-alerts">
          {alerts.length ? (
            <div className="space-y-2.5">
              {alerts.slice(0, 5).map((alert, index) => {
                const urgent = /emergency|critical|high/i.test(alert.level || alert.status || alert.type || '');
                return (
                  <div key={alert.id || index} className={`rounded-lg border px-3 py-3 ${urgent ? 'border-[#DC2626]/20 bg-[#FEF2F2]' : 'border-[#F59E0B]/20 bg-[#FFFBEB]'}`}>
                    <div className="flex items-start gap-2">
                      {urgent ? <MdEmergency className="mt-0.5 shrink-0 text-[#DC2626]" size={17} /> : <MdWarning className="mt-0.5 shrink-0 text-[#D97706]" size={17} />}
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
              <MdCheckCircle size={30} className="text-[#16A34A]" />
              <p className="mt-2 text-sm font-semibold text-[#1E293B]">No active alerts</p>
              <p className="mt-1 text-xs text-[#94A3B8]">Your assigned patients have no alerts requiring attention.</p>
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel title="Reminder Completion" description="Medication and appointment support completed over time." action="View medications" to="/dashboard/medications">
          {trend.length ? (
            <div className="h-64">
              <MiniChart data={trend} title="Reminder completion" valueSuffix="%" />
            </div>
          ) : (
            <EmptyState title="No reminder trend yet" message="Completion activity will appear here as reminders are handled." />
          )}
        </DashboardPanel>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardQuickAction icon={MdPeople} label="My Patients" description="Open assigned patient profiles" to="/dashboard/patients" color="#2563EB" />
          <DashboardQuickAction icon={MdMonitorHeart} label="Health Monitoring" description="Review recent health readings" to="/dashboard/monitoring" color="#16A34A" />
          <DashboardQuickAction icon={MdCalendarMonth} label="Appointments" description="Check upcoming patient visits" to="/dashboard/appointments" color="#0EA5E9" />
          <DashboardQuickAction icon={MdMessage} label="Messages" description="Contact the patient care team" to="/dashboard/messages" color="#7C3AED" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <DashboardPanel title="Assigned Patients" description="A concise view of the people currently assigned to you." action="View all patients" to="/dashboard/patients">
          {patients.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {patients.slice(0, 4).map((patient, index) => (
                <Link key={patient.id || index} to={patient.id ? `/dashboard/patients/${patient.id}` : '/dashboard/patients'} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors hover:border-[#2563EB]/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1E293B]">{patient.patientName || patient.name || 'Assigned patient'}</p>
                      <p className="mt-1 text-xs text-[#64748B]">Next reminder: {patient.nextReminder || 'None'}</p>
                      <p className="mt-1 text-xs text-[#64748B]">Appointment: {displayDashboardDate(patient.nextAppointment)}</p>
                    </div>
                    <MdArrowForward className="shrink-0 text-[#94A3B8]" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No assigned patients" message="Assigned patient summaries will appear here." />
          )}
        </DashboardPanel>

        <DashboardPanel title="Recent Care Notes" description="Latest care updates for continuity and follow-up.">
          {notes.length ? (
            <div className="divide-y divide-[#F1F5F9]">
              {notes.slice(0, 5).map((note, index) => (
                <div key={note.id || index} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#1E293B]">{note.title || note.patientName || note.action || 'Care update'}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{note.description || note.details || note.message || 'No additional details.'}</p>
                  {(note.time || note.dateTime || note.createdAt) && <p className="mt-1 text-[11px] text-[#94A3B8]">{displayDashboardDate(note.time || note.dateTime || note.createdAt)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent care notes" message="Recent care updates will appear here." />
          )}
        </DashboardPanel>
      </section>
    </div>
  );
}

export default CaregiverDashboard;
