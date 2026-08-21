import Badge from '../../../components/common/Badge.jsx';
import Card from '../../../components/common/Card.jsx';
import Table from '../../../components/common/Table.jsx';
import { formatDateTime } from '../../../utils/reportFormatting.js';

function statusVariant(status) {
  const value = String(status || '').toUpperCase();
  if (value.includes('SUCCESS') || value.includes('COMPLETED')) return 'success';
  if (value.includes('FAILED') || value.includes('ERROR') || value.includes('DENIED')) return 'critical';
  if (value.includes('WARNING') || value.includes('PENDING')) return 'warning';
  return 'info';
}

function ActivitySection({ title, activities = [], security = false }) {
  const columns = security
    ? [
        { key: 'date', header: 'Date' },
        { key: 'time', header: 'Time' },
        { key: 'email', header: 'Email' },
        { key: 'userRole', header: 'Role' },
        { key: 'ipAddress', header: 'IP Address' },
        { key: 'device', header: 'Device' },
        { key: 'actionType', header: 'Action' },
        {
          key: 'status',
          header: 'Status',
          render: (row) => <Badge variant={statusVariant(row.status)}>{row.status || 'INFO'}</Badge>
        },
        { key: 'message', header: 'Message' }
      ]
    : [
        { key: 'dateTime', header: 'Date and time', render: (row) => formatDateTime(row.dateTime) },
        { key: 'usernameOrEmail', header: 'User' },
        { key: 'actionType', header: 'Action' },
        {
          key: 'status',
          header: 'Status',
          render: (row) => <Badge variant={statusVariant(row.status)}>{row.status || 'INFO'}</Badge>
        },
        { key: 'message', header: 'Message' }
      ];

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-[#334155]">{title}</h2>
      <Table columns={columns} data={activities || []} emptyMessage="No data available for this section." />
    </Card>
  );
}

export default ActivitySection;
