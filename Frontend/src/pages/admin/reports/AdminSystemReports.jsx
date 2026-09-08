import { useState } from 'react';
import {
  MdDescription, MdLocalHospital, MdMedicalServices, MdMedication,
  MdPeople, MdPeopleAlt, MdCalendarMonth, MdVolunteerActivism,
} from 'react-icons/md';
import DashboardStatCell from '../../../components/dashboard/DashboardStatCell.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAdminSystemReport } from '../../../services/reportService.js';
import ActivitySection from '../../shared/reports/ActivitySection.jsx';
import ReportFilters from '../../shared/reports/ReportFilters.jsx';

const METRIC_META = {
  totalUsers: { label: 'Total Users', icon: MdPeople, color: '#2563EB' },
  totalPatients: { label: 'Total Patients', icon: MdPeopleAlt, color: '#0EA5E9' },
  totalDoctors: { label: 'Total Doctors', icon: MdLocalHospital, color: '#16A34A' },
  totalNurses: { label: 'Total Nurses', icon: MdMedicalServices, color: '#F59E0B' },
  totalCaregivers: { label: 'Total Caregivers', icon: MdVolunteerActivism, color: '#7C3AED' },
  totalAppointments: { label: 'Total Appointments', icon: MdCalendarMonth, color: '#0EA5E9' },
  totalMedications: { label: 'Total Medications', icon: MdMedication, color: '#16A34A' },
  totalReports: { label: 'Total Reports', icon: MdDescription, color: '#64748B' },
};

function AdminSystemReports() {
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const loadReport = (nextFilters) => {
    setLoading(true);
    setError('');
    getAdminSystemReport(nextFilters)
      .then(setReport)
      .catch(() => {
        setError('Unable to load the system report.');
        showToast({ type: 'error', message: 'Unable to load the system report.' });
      })
      .finally(() => setLoading(false));
  };

  const metrics = Object.entries(report?.metrics || {});

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e293b]">System Reports</h1>
        <p className="mt-1 text-sm text-[#64748b]">System-wide account and activity metrics.</p>
      </div>

      <ReportFilters filters={filters} onChange={setFilters} onSubmit={loadReport} loading={loading} />

      {loading && <LoadingSpinner label="Loading system report..." />}
      {!loading && error && <EmptyState title="System report could not be loaded" message={error} />}
      {!loading && !error && !report && (
        <EmptyState title="No report generated yet" message="Use the filters above to generate a system report." />
      )}
      {!loading && !error && report && (
        <>
          {metrics.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(([key, value]) => {
                const meta = METRIC_META[key] || { label: key, icon: MdDescription, color: '#64748B' };
                return <DashboardStatCell key={key} icon={meta.icon} label={meta.label} value={value} helper="" color={meta.color} />;
              })}
            </div>
          )}
          <ActivitySection title="Recent System Activity" items={report.activities || []} emptyMessage="No new accounts or reports in the selected period." />
        </>
      )}
    </div>
  );
}

export default AdminSystemReports;
