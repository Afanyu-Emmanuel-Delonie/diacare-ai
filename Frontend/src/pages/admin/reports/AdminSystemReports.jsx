import { useEffect, useState } from 'react';
import Badge from '../../../components/common/Badge.jsx';
import Card from '../../../components/common/Card.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAdminSystemReport } from '../../../services/reportService.js';
import { formatDate, formatLabel } from '../../../utils/reportFormatting.js';
import ActivitySection from '../../shared/reports/ActivitySection.jsx';
import ReportFilters from '../../shared/reports/ReportFilters.jsx';

const metricKeys = [
  'totalUsers',
  'totalPatients',
  'doctors',
  'nurses',
  'caregivers',
  'admins',
  'activeUsers',
  'inactiveUsers',
  'newlyCreatedAccounts',
  'deletedAccounts',
  'failedLoginCount',
  'passwordResetCount',
  'accountLockoutCount',
  'userRoleChangeCount',
  'reportDownloadCount'
];

const activitySections = [
  ['Login History', 'loginHistory'],
  ['Logout History', 'logoutHistory'],
  ['Failed Logins', 'failedLogins'],
  ['Password Resets', 'passwordResets'],
  ['Account Lockouts', 'accountLockouts'],
  ['User Role Changes', 'userRoleChanges'],
  ['Report Downloads', 'reportDownloads']
];

function AdminSystemReports() {
  const [filters, setFilters] = useState({});
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function loadReport() {
    setLoading(true);
    try {
      setReport(await getAdminSystemReport(filters));
    } catch {
      showToast({ type: 'error', message: 'Unable to load admin system report.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">System Operational Reports</h1>
          <p className="mt-2 text-sm text-[#334155]/80">System users, account activity, report downloads, and audit summaries.</p>
        </div>
        <button type="button" className="text-sm font-semibold text-[#2563EB] print:hidden" onClick={() => window.print()}>
          Printable view
        </button>
      </div>

      <ReportFilters filters={filters} setFilters={setFilters} onApply={loadReport} onReset={() => setFilters({})} showRole />

      {loading ? (
        <LoadingSpinner label="Loading admin system report..." />
      ) : (
        report && (
          <>
            <Card>
              <div className="flex flex-col justify-between gap-2 md:flex-row">
                <h2 className="text-lg font-bold text-[#334155]">Selected Period</h2>
                <Badge variant="info">
                  {formatDate(report.startDate)} to {formatDate(report.endDate)}
                </Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {metricKeys.map((key) => (
                  <div key={key} className="rounded-lg border border-[#334155]/15 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#334155]/70">{formatLabel(key)}</p>
                    <p className="mt-2 text-2xl font-bold text-[#334155]">{report[key] ?? 0}</p>
                  </div>
                ))}
              </div>
            </Card>

            {report.systemActivitySummary && (
              <Card>
                <h2 className="text-lg font-bold text-[#334155]">System Activity Summary</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {Object.entries(report.systemActivitySummary).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-[#334155]/15 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#334155]/70">{formatLabel(key)}</p>
                      <p className="mt-2 text-2xl font-bold text-[#334155]">{value ?? 0}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activitySections.map(([title, key]) => (
              <ActivitySection key={key} title={title} activities={report[key]} />
            ))}
          </>
        )
      )}
    </div>
  );
}

export default AdminSystemReports;
