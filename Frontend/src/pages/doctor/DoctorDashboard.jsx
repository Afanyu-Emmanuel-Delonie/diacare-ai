import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdArrowForward,
  MdCalendarMonth,
  MdCheckCircle,
  MdNoteAlt,
  MdPeople,
  MdPsychology,
  MdScience,
  MdWaterDrop,
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
  glucoseTrend: [],
  assignedPatientSummary: [],
  recentClinicalActivity: [],
  aiRiskAlertsList: [],
  sections: {},
};

const RISK_META = {
  CRITICAL: { color: '#DC2626', label: 'Critical' },
  HIGH:     { color: '#DC2626', label: 'High' },
  MODERATE: { color: '#D97706', label: 'Moderate' },
  NORMAL:   { color: '#16A34A', label: 'Normal' },
};

function riskMeta(level) {
  return RISK_META[String(level || '').toUpperCase()] || { color: '#94A3B8', label: level || 'No data' };
}

function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY_DATA);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    getDashboardData('DOCTOR')
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
  const trend = dashboardCollection(data, 'glucoseTrend');
  const activity = dashboardCollection(data, 'recentClinicalActivity');
  const riskAlerts = dashboardCollection(data, 'aiRiskAlertsList');
  const greetingName = user?.name ? `Dr. ${user.name.split(' ').slice(-1)[0]}` : (user?.username || 'Doctor');
  const aiRiskCount = Number(dashboardValue(data, 'aiRiskAlerts')) || 0;

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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">Doctor workspace</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1E293B]">Good day, {greetingName}</h1>
          <p className="mt-1 text-sm text-[#64748B]">Here is a clinical overview of your assigned patients.</p>
        </div>
        <Link
          to="/dashboard/patients"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          <MdPeople size={18} /> View patients
        </Link>
      </header>

      {status === 'error' && (
        <div className="rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Live dashboard data could not be loaded. Some values may be unavailable.
        </div>
      )}

      {aiRiskCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MdPsychology size={22} className="mt-0.5 shrink-0 text-[#DC2626]" />
            <div>
              <p className="text-sm font-semibold text-[#991B1B]">
                {aiRiskCount} AI-supported {aiRiskCount === 1 ? 'risk alert needs' : 'risk alerts need'} your review
              </p>
              <p className="mt-0.5 text-xs text-[#B91C1C]">High and critical risk patients are waiting on clinical review.</p>
            </div>
          </div>
          <Link
            to="/dashboard/ai-risk"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B91C1C]"
          >
            Review now <MdArrowForward size={14} />
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardStatCell icon={MdPeople} label="Assigned Patients" value={dashboardValue(data, 'assignedPatients')} helper="Patients in your care" color="#2563EB" />
        <DashboardStatCell icon={MdCalendarMonth} label="Today's Appointments" value={dashboardValue(data, 'todaysAppointments')} helper="Scheduled for today" color="#0EA5E9" />
        <DashboardStatCell icon={MdWaterDrop} label="Glucose Alerts" value={dashboardValue(data, 'recentGlucoseAlerts')} helper="Abnormal readings this week" color="#D97706" urgent />
        <DashboardStatCell icon={MdPsychology} label="AI Risk Alerts" value={dashboardValue(data, 'aiRiskAlerts')} helper="High or critical risk cases" color="#DC2626" urgent />
        <DashboardStatCell icon={MdScience} label="Recent Lab Results" value={dashboardValue(data, 'recentLabResults')} helper="New results this week" color="#16A34A" />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
        <DashboardPanel title="AI-supported and Glucose Alerts" description="Monitoring alerts for assigned patients only." action="View AI Risk" to="/dashboard/ai-risk">
          {riskAlerts.length ? (
            <div className="space-y-2.5">
              {riskAlerts.slice(0, 5).map((alert, index) => (
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
              <p className="mt-1 text-xs text-[#94A3B8]">Your assigned patients have no alerts requiring attention.</p>
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel title="Assigned Patient Glucose Trend" description="Recent glucose pattern for assigned patients." action="Open monitoring" to="/dashboard/monitoring">
          <MiniChart data={trend} title="Glucose trend" valueSuffix=" mg/dL" />
        </DashboardPanel>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardQuickAction icon={MdPeople} label="View Patients" description="Open assigned patient profiles and care records" to="/dashboard/patients" color="#2563EB" />
          <DashboardQuickAction icon={MdNoteAlt} label="Add Review" description="Create a clinical review for an assigned patient" to="/dashboard/medical-records/new" color="#16A34A" />
          <DashboardQuickAction icon={MdCalendarMonth} label="Appointments" description="Check today's scheduled visits" to="/dashboard/appointments" color="#0EA5E9" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <DashboardPanel title="Assigned Patients" description="Patients available through doctor assignment rules." action="View all patients" to="/dashboard/patients">
          {patients.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {patients.slice(0, 4).map((patient, index) => {
                const meta = riskMeta(patient.riskLevel);
                return (
                  <div key={patient.id || index} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1E293B]">{patient.name || 'Assigned patient'}</p>
                        <p className="mt-1 text-xs text-[#64748B]">Latest reading: {patient.lastReading || 'No data'}</p>
                      </div>
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: `${meta.color}18`, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No assigned patients" message="Assigned patient summaries will appear here." />
          )}
        </DashboardPanel>

        <DashboardPanel title="Recent Lab Results and Reviews" description="Clinical updates from assigned patient records.">
          {activity.length ? (
            <div className="divide-y divide-[#F1F5F9]">
              {activity.slice(0, 5).map((item, index) => (
                <div key={item.id || index} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#1E293B]">{item.title || 'Clinical update'}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{item.description || 'No additional details.'}</p>
                  {item.time && <p className="mt-1 text-[11px] text-[#94A3B8]">{displayDashboardDate(item.time)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent activity" message="Recent lab results and reviews will appear here." />
          )}
        </DashboardPanel>
      </section>
    </div>
  );
}

export default DoctorDashboard;
