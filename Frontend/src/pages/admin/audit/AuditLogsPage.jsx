import { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ExportButtons from '../../../components/common/ExportButtons.jsx';
import Input from '../../../components/common/Input.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import Pagination from '../../../components/common/Pagination.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Table from '../../../components/common/Table.jsx';
import useToast from '../../../hooks/useToast.js';
import { getAuditLogs } from '../../../services/auditLogService.js';
import { formatLabel } from '../../../utils/reportFormatting.js';

const auditCategories = [
  {
    key: 'LOGIN_HISTORY',
    label: 'Login History',
    actionTypes: ['LOGIN']
  },
  {
    key: 'LOGOUT_HISTORY',
    label: 'Logout History',
    actionTypes: ['LOGOUT']
  },
  {
    key: 'FAILED_LOGINS',
    label: 'Failed Login Attempts',
    actionTypes: ['LOGIN_FAILED', 'REPEATED_LOGIN_FAILED']
  },
  {
    key: 'UNAUTHORIZED_ACCESS',
    label: 'Unauthorized Access',
    actionTypes: ['UNAUTHORIZED_ACCESS']
  },
  {
    key: 'ACCOUNT_LOCKOUTS',
    label: 'Account Lockouts',
    actionTypes: ['ACCOUNT_LOCKOUT']
  },
  {
    key: 'PASSWORD_RESETS',
    label: 'Password Resets',
    actionTypes: ['PASSWORD_RESET']
  },
  {
    key: 'REPORT_DOWNLOADS',
    label: 'Report Downloads',
    actionTypes: ['REPORT_DOWNLOADED', 'REPORT_REQUESTED']
  },
  {
    key: 'ADMIN_ACTIONS',
    label: 'Admin Actions',
    actionTypes: ['ADMIN_ACTION', 'USER_CREATED', 'USER_DELETED', 'USER_ROLE_CHANGED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'SETTINGS_UPDATED']
  },
  {
    key: 'PATIENT_RECORD_CHANGES',
    label: 'Patient Record Changes',
    actionTypes: ['PATIENT_RECORD_CREATED', 'PATIENT_RECORD_UPDATED', 'PATIENT_RECORD_DELETED']
  },
  {
    key: 'MEDICATION_CHANGES',
    label: 'Medication Record Changes',
    actionTypes: ['MEDICATION_CREATED', 'MEDICATION_UPDATED', 'MEDICATION_DELETED']
  },
  {
    key: 'APPOINTMENT_CHANGES',
    label: 'Appointment Changes',
    actionTypes: ['APPOINTMENT_CREATED', 'APPOINTMENT_UPDATED', 'APPOINTMENT_DELETED']
  },
  {
    key: 'SYSTEM_ERRORS',
    label: 'System Errors',
    actionTypes: ['SYSTEM_ERROR']
  }
];

const actionTypeOptions = [
  'LOGIN',
  'LOGOUT',
  'LOGIN_FAILED',
  'REPEATED_LOGIN_FAILED',
  'UNAUTHORIZED_ACCESS',
  'REPORT_REQUESTED',
  'REPORT_DOWNLOADED',
  'PASSWORD_RESET',
  'ACCOUNT_LOCKOUT',
  'USER_CREATED',
  'USER_DELETED',
  'USER_ROLE_CHANGED',
  'USER_ACTIVATED',
  'USER_DEACTIVATED',
  'ADMIN_ACTION',
  'PATIENT_RECORD_CREATED',
  'PATIENT_RECORD_UPDATED',
  'PATIENT_RECORD_DELETED',
  'MEDICATION_CREATED',
  'MEDICATION_UPDATED',
  'MEDICATION_DELETED',
  'APPOINTMENT_CREATED',
  'APPOINTMENT_UPDATED',
  'APPOINTMENT_DELETED',
  'SYSTEM_ERROR',
  'SETTINGS_UPDATED',
  'AI_PREDICTION_CREATED',
  'DOCTOR_REVIEW_CREATED'
];

function AuditLogsPage() {
  const [filters, setFilters] = useState({});
  const [logs, setLogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  async function loadLogs() {
    setLoading(true);
    try {
      setLogs(await getAuditLogs(filters));
      setPage(0);
    } catch {
      showToast({ type: 'error', message: 'Unable to load audit logs.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const categoryCounts = useMemo(() => {
    return auditCategories.reduce((counts, category) => {
      counts[category.key] = logs.filter((log) => category.actionTypes.includes(log.actionType)).length;
      return counts;
    }, {});
  }, [logs]);

  const visibleLogs = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return logs;
    }

    const category = auditCategories.find((item) => item.key === selectedCategory);
    return category ? logs.filter((log) => category.actionTypes.includes(log.actionType)) : logs;
  }, [logs, selectedCategory]);

  const totalPages = Math.ceil(visibleLogs.length / pageSize);
  const paginatedLogs = visibleLogs.slice(page * pageSize, page * pageSize + pageSize);

  const columns = [
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'email', header: 'Email' },
    { key: 'userRole', header: 'Role' },
    { key: 'ipAddress', header: 'IP Address' },
    { key: 'device', header: 'Device' },
    { key: 'actionType', header: 'Action', render: (row) => formatLabel(row.actionType) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'INFO'} />
    },
    { key: 'message', header: 'Message' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">Audit Logs</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#334155]/80">
            Review authentication events, access attempts, account changes, report downloads, clinical record changes, and system errors.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          Printable view
        </Button>
      </div>

      <Card>
        <form
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            loadLogs();
          }}
        >
          <Input label="Start date" id="auditStartDate" type="date" value={filters.startDate || ''} onChange={(event) => updateFilter('startDate', event.target.value)} />
          <Input label="End date" id="auditEndDate" type="date" value={filters.endDate || ''} onChange={(event) => updateFilter('endDate', event.target.value)} />
          <Input label="Email" id="auditEmail" type="email" value={filters.email || ''} onChange={(event) => updateFilter('email', event.target.value)} />
          <Input label="IP address" id="auditIp" value={filters.ip || ''} onChange={(event) => updateFilter('ip', event.target.value)} />
          <div className="space-y-2">
            <label htmlFor="auditRole" className="block text-sm font-semibold text-[#334155]">
              Role
            </label>
            <select
              id="auditRole"
              className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              value={filters.role || ''}
              onChange={(event) => updateFilter('role', event.target.value)}
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="CAREGIVER">Caregiver</option>
              <option value="PATIENT">Patient</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="auditActionType" className="block text-sm font-semibold text-[#334155]">
              Action type
            </label>
            <select
              id="auditActionType"
              className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              value={filters.actionType || ''}
              onChange={(event) => updateFilter('actionType', event.target.value)}
            >
              <option value="">All actions</option>
              {actionTypeOptions.map((actionType) => (
                <option key={actionType} value={actionType}>
                  {formatLabel(actionType)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="auditStatus" className="block text-sm font-semibold text-[#334155]">
              Status
            </label>
            <select
              id="auditStatus"
              className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              value={filters.status || ''}
              onChange={(event) => updateFilter('status', event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="flex items-end gap-3">
            <Button type="submit">Apply filters</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFilters({});
                setSelectedCategory('ALL');
                setPage(0);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('ALL');
            setPage(0);
          }}
          className={`rounded-lg border p-4 text-left ${selectedCategory === 'ALL' ? 'border-[#2563EB] bg-[#2563EB] text-[#FFFFFF]' : 'border-[#334155]/15 bg-[#FFFFFF] text-[#334155]'}`}
        >
          <p className="text-sm font-semibold">All Audit Logs</p>
          <p className="mt-2 text-2xl font-bold">{logs.length}</p>
        </button>
        {auditCategories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => {
              setSelectedCategory(category.key);
              setPage(0);
            }}
            className={`rounded-lg border p-4 text-left ${selectedCategory === category.key ? 'border-[#2563EB] bg-[#2563EB] text-[#FFFFFF]' : 'border-[#334155]/15 bg-[#FFFFFF] text-[#334155]'}`}
          >
            <p className="text-sm font-semibold">{category.label}</p>
            <p className="mt-2 text-2xl font-bold">{categoryCounts[category.key] || 0}</p>
          </button>
        ))}
      </div>

      <ExportButtons data={visibleLogs} fileName="audit-logs" />

      <Card className="p-0">
        {loading ? (
          <LoadingSpinner label="Loading audit logs..." />
        ) : (
          <>
            <div className="px-4 py-4">
              <h2 className="text-lg font-bold text-[#334155]">
                {selectedCategory === 'ALL'
                  ? 'All Audit Logs'
                  : auditCategories.find((category) => category.key === selectedCategory)?.label}
              </h2>
              <p className="mt-1 text-sm text-[#334155]/80">Every row includes date, time, user, role, IP address, device, action, and status.</p>
            </div>
            <Table columns={columns} data={paginatedLogs} emptyMessage="No data available for this section." />
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={visibleLogs.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(0);
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}

export default AuditLogsPage;
