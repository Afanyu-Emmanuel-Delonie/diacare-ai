import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import { getGlucoseReading, getLabResult, monitoringTypes, normalizeMonitoringRecord } from '../../../services/healthMonitoringService.js';

function HealthRecordDetails({ type }) {
  const config = monitoringTypes[type];
  const { id } = useParams();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canUpdate = [ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT].includes(userRole);

  useEffect(() => {
    const request = config.backendType === 'glucose' ? getGlucoseReading(id) : getLabResult(id);
    request
      .then((response) => setRecord(normalizeMonitoringRecord(response.data, type)))
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load monitoring record.');
        setError(message);
        showToast({ type: 'error', message });
      })
      .finally(() => setLoading(false));
  }, [config.backendType, id, showToast, type]);

  if (loading) {
    return <LoadingSpinner label="Loading monitoring record..." />;
  }

  if (!record) {
    return <EmptyState title="Monitoring record could not be loaded" message={error || 'Record was not found.'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">{config.detailTitle}</h1>
          <p className="mt-1 text-[#334155]/80">Record detail for observational monitoring data.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/dashboard/monitoring/${config.route}`}>
            <Button variant="secondary">Back to records</Button>
          </Link>
          {canUpdate && (
            <Link to={`/dashboard/monitoring/${config.route}/${record.id}/edit`}>
              <Button variant="secondary">Update record</Button>
            </Link>
          )}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Patient" value={record.patientName} />
        <DetailCard label="Recorded By" value={record.recordedBy} />
        <DetailCard label="Reading Status" value={<StatusBadge status={record.status} />} />
        <DetailCard label="Reading Value" value={`${record.value} ${record.unit}`.trim()} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-[#334155]">Record Information</h2>
          <dl className="mt-4 grid gap-4 md:grid-cols-2">
            <Detail label="Date" value={formatDate(record.dateTime)} />
            <Detail label="Time" value={formatTime(record.dateTime)} />
            <Detail label="Created At" value={formatDateTime(record.createdAt)} />
            <Detail label="Last Updated" value={formatDateTime(record.updatedAt)} />
            <Detail label="Unit" value={record.unit || 'Not provided'} />
            <Detail label="Reference Range" value={record.referenceRange || 'Not provided'} />
            <Detail label="Laboratory" value={record.laboratory || 'Not provided'} />
            <Detail label="Doctor" value={record.doctor || 'Not provided'} />
          </dl>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-[#334155]">Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#334155]/85">{record.notes || 'No notes recorded.'}</p>
        </Card>
      </section>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-[#334155]/70">{label}</p>
      <div className="mt-2 text-lg font-bold text-[#334155]">{value}</div>
    </Card>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-[#334155]/70">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#334155]">{value}</dd>
    </div>
  );
}

function formatDate(value) {
  return value ? String(value).slice(0, 10) : 'Not available';
}

function formatTime(value) {
  return value && String(value).includes('T') ? String(value).slice(11, 16) : 'Not available';
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : 'Not available';
}

export default HealthRecordDetails;
