import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import Table from '../../../components/common/Table.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAdminSecurityAuditReport, getAuditLogs } from '../../../services/reportService.js';
import ActivitySection from '../../shared/reports/ActivitySection.jsx';
import ReportFilters from '../../shared/reports/ReportFilters.jsx';

const securitySections = [
  ['Login Success', 'loginSuccess'],
  ['Logout', 'logout'],
  ['Failed Logins', 'failedLogins'],
  ['Repeated Failed Logins', 'repeatedFailedLogins'],
  ['Unauthorized Access', 'unauthorizedAccess'],
  ['Admin Actions', 'adminActions'],
  ['Patient Record Changes', 'patientRecordChanges'],
  ['Medication Changes', 'medicationChanges'],
  ['Appointment Changes', 'appointmentChanges'],
  ['Report Downloads', 'reportDownloads'],
  ['System Errors', 'systemErrors']
];

function SecurityAuditReports() {
  const [filters, setFilters] = useState({});
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  async function loadReport() {
    setLoading(true);
    try {
      const [reportData, logData] = await Promise.all([getAdminSecurityAuditReport(filters), getAuditLogs(filters)]);
      setReport(reportData);
      setLogs(logData);
    } catch {
      showToast({ type: 'error', message: 'Unable to load security audit report.' });
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
          <h1 className="text-2xl font-bold text-[#334155]">Security Audit Reports</h1>
          <p className="mt-2 text-sm text-[#334155]/80">Login events, unauthorized access, report downloads, and system errors.</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          Printable view
        </Button>
      </div>

      <ReportFilters filters={filters} setFilters={setFilters} onApply={loadReport} onReset={() => setFilters({})} showRole />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input label="Email" id="email" value={filters.email || ''} onChange={(event) => updateFilter('email', event.target.value)} />
          <Input label="IP address" id="ip" value={filters.ip || ''} onChange={(event) => updateFilter('ip', event.target.value)} />
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-semibold text-[#334155]">
              Status
            </label>
            <select
              id="status"
              className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155]"
              value={filters.status || ''}
              onChange={(event) => updateFilter('status', event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="DENIED">Denied</option>
            </select>
          </div>
          <Input
            label="Action type"
            id="actionType"
            value={filters.actionType || ''}
            onChange={(event) => updateFilter('actionType', event.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner label="Loading security audit report..." />
      ) : (
        <>
          {securitySections.map(([title, key]) => (
            <ActivitySection key={key} title={title} activities={report?.[key]} security />
          ))}
          <Card>
            <h2 className="mb-4 text-lg font-bold text-[#334155]">Audit Logs</h2>
            <Table
              columns={[
                { key: 'date', header: 'Date' },
                { key: 'time', header: 'Time' },
                { key: 'email', header: 'Email' },
                { key: 'userRole', header: 'Role' },
                { key: 'ipAddress', header: 'IP' },
                { key: 'device', header: 'Device' },
                { key: 'actionType', header: 'Action' },
                { key: 'status', header: 'Status' },
                { key: 'message', header: 'Message' }
              ]}
              data={logs}
              emptyMessage="No data available for this section."
            />
          </Card>
        </>
      )}
    </div>
  );
}

export default SecurityAuditReports;
