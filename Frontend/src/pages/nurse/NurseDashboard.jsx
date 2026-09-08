import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdArrowForward,
  MdCalendarMonth,
  MdCheckCircle,
  MdMedication,
  MdMonitorHeart,
  MdNotifications,
  MdPeople,
  MdWarning,
} from 'react-icons/md';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import DashboardQuickAction from '../../components/dashboard/DashboardQuickAction.jsx';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton.jsx';
import DashboardStatCell from '../../components/dashboard/DashboardStatCell.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import MiniChart from '../../components/common/MiniChart.jsx';
import { getDashboardData } from '../../services/dashboardService.js';
import { dashboardCollection, dashboardValue, displayDashboardDate } from '../../utils/dashboardData.js';

const EMPTY_DATA = {
  stats: {},
  glucoseMonitoringTrend: [],
  careTasks: [],
  recentCareActivity: [],
  abnormalReadingAlerts: [],
  sections: {},
};

function NurseDashboard() {
  const [data, setData] = useState(EMPTY_DATA);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    getDashboardData('NURSE')
      .then((response) => {
        if (active) {
          setData({ ...EMPTY_DATA, ...response });
          setStatus('ready');
        }
      })
      .catch(() => active && setStatus('error'));
    return () => { active = false; };
  }, []);

  const tasks = dashboardCollection(data, 'careTasks');
  const trend = dashboardCollection(data, 'glucoseMonitoringTrend');
  const activity = dashboardCollection(data, 'recentCareActivity');
  const alerts = dashboardCollection(data, 'abnormalReadingAlerts');
  const abnormalCount = Number(dashboardValue(data, 'abnormalReadings')) || 0;

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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">Nurse workspace</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1E293B]">Nursing Overview</h1>
          <p className="mt-1 text-sm text-[#64748B]">Monitoring tasks, medication reminders, and abnormal readings across patients.</p>
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

      {abnormalCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MdWarning size={22} className="mt-0.5 shrink-0 text-[#D97706]" />
            <div>
              <p className="text-sm font-semibold text-[#92400E]">
                {abnormalCount} {abnormalCount === 1 ? 'patient needs' : 'patients need'} follow-up on an abnormal reading
              </p>
              <p className="mt-0.5 text-xs text-[#92400E]/80">Review these readings and coordinate follow-up care.</p>
            </div>
          </div>
          <Link
            to="/dashboard/ai-risk/abnormal-alerts"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#D97706] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B45309]"
          >
            Review now <MdArrowForward size={14} />
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardStatCell icon={MdPeople} label="Patients" value={dashboardValue(data, 'assignedPatients')} helper="Patients under nursing care" color="#2563EB" />
        <DashboardStatCell icon={MdCalendarMonth} label="Today's Appointments" value={dashboardValue(data, 'todaysAppointments')} helper="Requiring nursing support" color="#0EA5E9" />
        <DashboardStatCell icon={MdMedication} label="Active Medications" value={dashboardValue(data, 'activeMedications')} helper="Currently prescribed" color="#16A34A" />
        <DashboardStatCell icon={MdWarning} label="Missed Medication" value={dashboardValue(data, 'missedMedicationAlerts')} helper="Adherence alerts" color="#DC2626" urgent />
        <DashboardStatCell icon={MdMonitorHeart} label="Abnormal Readings" value={dashboardValue(data, 'abnormalReadings')} helper="Requiring follow-up" color="#D97706" urgent />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <DashboardPanel title="Abnormal Readings" description="Assigned patient alerts for nursing follow-up." action="View all alerts" to="/dashboard/ai-risk/abnormal-alerts">
          {alerts.length ? (
            <div className="space-y-2.5">
              {alerts.slice(0, 5).map((alert, index) => (
                <div key={alert.id || index} className="rounded-lg border border-[#F59E0B]/20 bg-[#FFFBEB] px-3 py-3">
                  <p className="text-sm font-semibold text-[#1E293B]">{alert.title || 'Patient alert'}</p>
                  <p className="mt-0.5 text-xs text-[#64748B]">{alert.message || 'Review this alert for more information.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <MdCheckCircle size={30} className="text-[#16A34A]" />
              <p className="mt-2 text-sm font-semibold text-[#1E293B]">No active alerts</p>
              <p className="mt-1 text-xs text-[#94A3B8]">No patients currently have alerts requiring attention.</p>
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel title="Glucose Monitoring Trend" description="Recent glucose pattern across monitored patients." action="Open monitoring" to="/dashboard/monitoring">
          <MiniChart data={trend} title="Glucose trend" valueSuffix=" mg/dL" />
        </DashboardPanel>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardQuickAction icon={MdPeople} label="Monitor Patients" description="View patient monitoring records" to="/dashboard/patients" color="#2563EB" />
          <DashboardQuickAction icon={MdWarning} label="View Alerts" description="Review medication and abnormal reading alerts" to="/dashboard/notifications" color="#D97706" />
          <DashboardQuickAction icon={MdMonitorHeart} label="Update Care Notes" description="Open medical records to add care updates" to="/dashboard/medical-records" color="#16A34A" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <DashboardPanel title="Follow-up Tasks" description="Patients with an abnormal reading awaiting nursing follow-up.">
          {tasks.length ? (
            <div className="divide-y divide-[#F1F5F9]">
              {tasks.slice(0, 6).map((task, index) => (
                <div key={index} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E293B]">{task.patientName}</p>
                    <p className="mt-0.5 truncate text-xs text-[#64748B]">{task.task}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#F59E0B]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#D97706]">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No follow-up tasks" message="Patients needing nursing follow-up will appear here." />
          )}
        </DashboardPanel>

        <DashboardPanel title="Recent Nursing Activity" description="Recent care actions and patient monitoring updates.">
          {activity.length ? (
            <div className="divide-y divide-[#F1F5F9]">
              {activity.slice(0, 5).map((item, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#1E293B]">{item.title || 'Care update'}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{item.description || 'No additional details.'}</p>
                  {item.time && <p className="mt-1 text-[11px] text-[#94A3B8]">{displayDashboardDate(item.time)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent activity" message="Recent nursing activity will appear here." />
          )}
        </DashboardPanel>
      </section>
    </div>
  );
}

export default NurseDashboard;
