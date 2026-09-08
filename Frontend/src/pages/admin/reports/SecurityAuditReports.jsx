import { useState } from 'react';
import { MdBlock, MdErrorOutline, MdLock, MdLogin, MdWarning } from 'react-icons/md';
import DashboardStatCell from '../../../components/dashboard/DashboardStatCell.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAdminSecurityAuditReport } from '../../../services/reportService.js';
import ActivitySection from '../../shared/reports/ActivitySection.jsx';
import ReportFilters from '../../shared/reports/ReportFilters.jsx';

const METRIC_META = {
  totalLoginAttempts: { label: 'Total Login Attempts', icon: MdLogin, color: '#2563EB' },
  failedLogins: { label: 'Failed Logins', icon: MdWarning, color: '#D97706', urgent: true },
  unauthorizedAccessAttempts: { label: 'Unauthorized Access', icon: MdBlock, color: '#DC2626', urgent: true },
  accountLockouts: { label: 'Account Lockouts', icon: MdLock, color: '#DC2626', urgent: true },
  systemErrors: { label: 'System Errors', icon: MdErrorOutline, color: '#64748B' },
};

function SecurityAuditReports() {
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const loadReport = (nextFilters) => {
    setLoading(true);
    setError('');
    getAdminSecurityAuditReport(nextFilters)
      .then(setReport)
      .catch(() => {
        setError('Unable to load the security audit report.');
        showToast({ type: 'error', message: 'Unable to load the security audit report.' });
      })
      .finally(() => setLoading(false));
  };

  const metrics = Object.entries(report?.metrics || {});

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D97706]">Security</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1e293b]">Security Audit Reports</h1>
        <p className="mt-1 text-sm text-[#64748b]">Failed logins, unauthorized access attempts, and account lockouts.</p>
      </div>

      <ReportFilters filters={filters} onChange={setFilters} onSubmit={loadReport} loading={loading} />

      {loading && <LoadingSpinner label="Loading security audit report..." />}
      {!loading && error && <EmptyState title="Security audit report could not be loaded" message={error} />}
      {!loading && !error && !report && (
        <EmptyState title="No report generated yet" message="Use the filters above to generate a security audit report." />
      )}
      {!loading && !error && report && (
        <>
          {metrics.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {metrics.map(([key, value]) => {
                const meta = METRIC_META[key] || { label: key, icon: MdErrorOutline, color: '#64748B' };
                return <DashboardStatCell key={key} icon={meta.icon} label={meta.label} value={value} helper="" color={meta.color} urgent={meta.urgent} />;
              })}
            </div>
          )}
          <ActivitySection title="Security Events" items={report.events || []} emptyMessage="No security events in the selected period." />
        </>
      )}
    </div>
  );
}

export default SecurityAuditReports;
