import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MdArrowBack,
  MdAssignment,
  MdBadge,
  MdChatBubbleOutline,
  MdEdit,
  MdHealing,
  MdLocalHospital,
  MdNoteAlt,
  MdPerson,
  MdSchedule,
  MdSick,
  MdWarningAmber,
} from 'react-icons/md';
import Card from '../../../components/common/Card.jsx';
import Button from '../../../components/common/Button.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { getMedicalRecord, getRecordStatus } from '../../../services/medicalRecordService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

function MedicalRecordDetails() {
  const { id } = useParams();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = userRole === ROLES.DOCTOR;

  useEffect(() => {
    getMedicalRecord(id)
      .then((response) => setRecord(response.data))
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load medical record.');
        setError(message);
        showToast({ type: 'error', message });
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  if (loading) {
    return <LoadingSpinner label="Loading medical record..." />;
  }

  if (!record) {
    return <EmptyState title="Medical record could not be loaded" message={error || 'Record was not found.'} />;
  }

  const patientLabel = record.patientName || `Patient #${record.patientId}`;

  return (
    <div className="space-y-6">
      <Link to="/dashboard/medical-records" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
        <MdArrowBack size={16} /> Back to records
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#334155]">{patientLabel}</h1>
            <StatusBadge status={getRecordStatus(record)} />
          </div>
          <p className="mt-1 text-[#334155]/70">{record.diagnosis}</p>
        </div>
        {canEdit && (
          <Link to={`/dashboard/medical-records/${record.id}/edit`}>
            <Button variant="secondary" className="flex items-center gap-1.5">
              <MdEdit size={16} /> Edit record
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem icon={MdPerson} label="Patient" value={patientLabel} />
          <DetailItem icon={MdBadge} label="Patient ID" value={record.patientCode || 'Not available'} />
          <DetailItem icon={MdLocalHospital} label="Doctor" value={record.doctorName || 'Not available'} />
          <DetailItem icon={MdSchedule} label="Recorded" value={formatDateTime(record.recordDateTime || record.recordDate)} />
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10">
            <MdAssignment size={20} className="text-[#2563EB]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#334155]">Diagnosis</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#334155]/85">{record.diagnosis || 'No diagnosis recorded.'}</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <RecordCard icon={MdWarningAmber} color="#F59E0B" title="Allergies" value={record.allergies} emptyText="No allergies recorded." />
        <RecordCard icon={MdSick} color="#DC2626" title="Symptoms" value={record.symptoms} emptyText="No symptoms recorded." />
        <RecordCard icon={MdHealing} color="#16A34A" title="Treatment Plan Summary" value={record.treatmentPlan} emptyText="No treatment plan recorded." />
        <RecordCard icon={MdNoteAlt} color="#0EA5E9" title="Medical History Notes" value={record.notes} emptyText="Limited view for this role." />
        <RecordCard icon={MdChatBubbleOutline} color="#7C3AED" title="Doctor Notes" value={record.doctorNotes} emptyText="Limited view for this role." />
      </section>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9]">
        <Icon size={16} className="text-[#64748B]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[#334155]">{value}</p>
      </div>
    </div>
  );
}

function RecordCard({ icon: Icon, color, title, value, emptyText = 'No data available for this section.' }) {
  return (
    <Card>
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}16` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#334155]/85">{value || emptyText}</p>
    </Card>
  );
}

function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString();
}

export default MedicalRecordDetails;
