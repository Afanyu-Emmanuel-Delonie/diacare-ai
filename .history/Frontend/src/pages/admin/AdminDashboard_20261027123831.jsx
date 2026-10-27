import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdDescription,
  MdLocalHospital,
  MdManageAccounts,
  MdPeople,
  MdPeopleAlt,
  MdSecurity,
  MdSettings,
} from 'react-icons/md';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import DashboardQuickAction from '../../components/dashboard/DashboardQuickAction.jsx';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton.jsx';
import DashboardStatCell from '../../components/dashboard/DashboardStatCell.jsx';
import DonutChart from '../../components/common/DonutChart.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import MiniChart from '../../components/common/MiniChart.jsx';
import { getDashboardData } from '../../services/dashboardService.js';
import { dashboardCollection, dashboardValue, displayDashboardDate } from '../../utils/dashboardData.js';

const EMPTY_DATA = {
  stats: {},
  userSignupTrend: [],
  recentSystemActivity: [],
  sections: {},
};

function AdminDashboard() {
  const [data, setData] = useState(EMPTY_DATA);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    getDashboardData('ADMIN')
      .then((response) => {
        if (active) {
          setData({ ...EMPTY_DATA, ...response });
          setStatus('ready');
        }
      })
      .catch(() => active && setStatus('error'));
    return () => { active = false; };
  }, []);

  const trend = dashboardCollection(data, 'userSignupTrend');
  const activity = dashboardCollection(data, 'recentSystemActivity');
  const composition = [
    { label: 'Patients', value: Number(dashboardValue(data, 'totalPatients')) || 0, color: '#0EA5E9' },
    { label: 'Doctors', value: Number(dashboardValue(data, 'totalDoctors')) || 0, color: '#16A34A' },
    { label: 'Nurses', value: Number(dashboardValue(data, 'totalNurses')) || 0, color: '#F59E0B' },
    { label: 'Caregivers', value: Number(dashboardValue(data, 'totalCaregivers')) || 0, color: '#7C3AED' },
  ].filter((entry) => entry.value > 0);

  if (status === 'loading') {
    return (
      <div className="space-y-5">
        <div className="h-14 max-w-sm animate-pulse rounded-2xl bg-[#E2E8F0]" />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-[#0F172A]">System Overview</h1>
          <p className="mt-1 text-sm text-[#64748B]">Users, patients, and system activity at a glance.</p>
        </div>
        <Link
          to="/dashboard/admin/users"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-[#1D4ED8]"
        >
          <MdManageAccounts size={18} /> Manage users
        </Link>
      </header>

      {status === 'error' && (
        <div className="rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Live dashboard data could not be loaded. Some values may be unavailable.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCell icon={MdPeople} label="Total Users" value={dashboardValue(data, 'totalUsers')} helper="Registered accounts" color="#2563EB" bold />
        <DashboardStatCell icon={MdPeopleAlt} label="Total Patients" value={dashboardValue(data, 'totalPatients')} helper="In active care" color="#0EA5E9" />
        <DashboardStatCell icon={MdLocalHospital} label="Total Doctors" value={dashboardValue(data, 'totalDoctors')} helper="Doctor accounts" color="#16A34A" />
        <DashboardStatCell icon={MdDescription} label="Total Reports" value={dashboardValue(data, 'totalReports')} helper="Generated reports" color="#64748B" />
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <DashboardPanel title="Account Signups" description="New accounts created over the last 7 days.">
          <MiniChart data={trend} title="Signups" valueSuffix=" new" variant="bar" />
        </DashboardPanel>

        <DashboardPanel title="Recent System Activity" description="New accounts and reports from the last 7 days.">
          {activity.length ? (
            <div className="divide-y divide-[#F1F5F9]">
              {activity.slice(0, 6).map((item, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#1E293B]">{item.title || 'System activity'}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{item.description || 'No additional details.'}</p>
                  {item.time && <p className="mt-1 text-[11px] text-[#94A3B8]">{displayDashboardDate(item.time)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent activity" message="New accounts and reports will appear here as they happen." />
          )}
        </DashboardPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <DashboardPanel title="Care Team & Patient Mix" description="Share of registered accounts by role.">
          {composition.length ? (
            <DonutChart data={composition} centerLabel="People" />
          ) : (
            <EmptyState title="No data yet" message="Role counts will appear here once accounts exist." />
          )}
        </DashboardPanel>

        <DashboardPanel title="Quick Actions" description="Common administrator tasks.">
          <div className="grid gap-3 sm:grid-cols-2">
            <DashboardQuickAction icon={MdManageAccounts} label="Manage Users" description="Create, edit, deactivate, review" to="/dashboard/admin/users" color="#2563EB" />
            <DashboardQuickAction icon={MdDescription} label="View Reports" description="Operational and audit reporting" to="/dashboard/reports/admin/system" color="#16A34A" />
            <DashboardQuickAction icon={MdSecurity} label="Audit Logs" description="Login, access, download activity" to="/dashboard/admin/audit-logs" color="#D97706" />
            <DashboardQuickAction icon={MdSettings} label="System Settings" description="Report branding and settings" to="/dashboard/admin/settings" color="#64748B" />
          </div>
        </DashboardPanel>
      </section>
    </div>
  );
}

export default AdminDashboard;
