import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  MdArrowBack,
  MdArrowForward,
  MdCalendarMonth,
  MdEmail,
  MdFolderOpen,
  MdMedication,
  MdMessage,
  MdMonitorHeart,
  MdPhone,
  MdPsychology,
  MdSummarize,
} from 'react-icons/md';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  deactivatePatient, deletePatient, getPatient,
  getPatientDisplayName, getPatientInitialFormData, getPatientStatus,
} from '../../../services/patientService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: '' });

  const canDelete = userRole === ROLES.ADMIN;
  const canDeactivate = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE].includes(userRole);
  const canEdit = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT].includes(userRole);
  const showCareLinks = userRole !== ROLES.PATIENT;

  const loadPatient = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPatient(id);
      setPatient(response.data);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load patient.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPatient(); }, [id]);

  const confirmAction = async () => {
    try {
      if (dialog.type === 'delete') {
        await deletePatient(id);
        showToast({ type: 'success', message: 'Patient archived successfully where allowed.' });
        navigate('/dashboard/patients');
      } else {
        await deactivatePatient(id);
        showToast({ type: 'success', message: 'Patient deactivated successfully.' });
        setDialog({ open: false, type: '' });
        await loadPatient();
      }
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Patient action failed.');
      showToast({ type: 'error', message });
      setDialog({ open: false, type: '' });
    }
  };

  if (loading) return <LoadingSpinner label="Loading patient details..." />;
  if (!patient) return <EmptyState title="Patient could not be loaded" message={error || 'Patient was not found.'} />;

  const formPatient = getPatientInitialFormData(patient);
  const status = getPatientStatus(patient);
  const name = getPatientDisplayName(patient);

  return (
    <div className="space-y-6">
      <Link to="/dashboard/patients" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
        <MdArrowBack size={16} /> Back to patients
      </Link>

      {/* Profile hero */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-xl font-bold text-[#2563EB]">
              {getInitials(name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'warning' : 'critical'}>{status}</Badge>
                <Badge variant="info">{patient.diabetesType || 'Diabetes type not specified'}</Badge>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-[#1e293b]">{name}</h1>
              <p className="mt-0.5 text-sm text-[#64748b]">Patient ID: {patient.patientCode || 'Not available'}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#64748b]">
                <span className="inline-flex items-center gap-1.5"><MdEmail size={14} className="text-[#94a3b8]" /> {patient.email || 'Not provided'}</span>
                <span className="inline-flex items-center gap-1.5"><MdPhone size={14} className="text-[#94a3b8]" /> {patient.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link to={`/dashboard/patients/${patient.id}/edit`}>
                <Button variant="secondary">Edit profile</Button>
              </Link>
            )}
            {canDeactivate && (
              <Button variant="warning" disabled={!patient.active || patient.deleted} onClick={() => setDialog({ open: true, type: 'deactivate' })}>
                Deactivate
              </Button>
            )}
            {canDelete && (
              <Button variant="critical" disabled={patient.deleted} onClick={() => setDialog({ open: true, type: 'delete' })}>
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick care links */}
      {showCareLinks && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Care Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CareLink icon={MdMonitorHeart} label="Health Monitoring" description="Readings and health timeline" to={`/dashboard/monitoring?patientId=${patient.id}`} color="#2563EB" />
            <CareLink icon={MdMedication} label="Medications" description="Schedule and adherence" to={`/dashboard/medications?patientId=${patient.id}`} color="#16A34A" />
            <CareLink icon={MdCalendarMonth} label="Appointments" description="Upcoming visits and history" to={`/dashboard/appointments?patientId=${patient.id}`} color="#0EA5E9" />
            <CareLink icon={MdPsychology} label="Risk Alerts" description="Abnormal and urgent alerts" to={`/dashboard/ai-risk/patient-summary?patientId=${patient.id}`} color="#DC2626" />
            <CareLink icon={MdFolderOpen} label="Medical History" description="Care notes and records" to={`/dashboard/medical-records/history?patientEmail=${encodeURIComponent(patient.email || '')}`} color="#7C3AED" />
            <CareLink icon={MdSummarize} label="Reports" description="Generated patient reports" to={`/dashboard/reports?patientId=${patient.id}`} color="#D97706" />
            <CareLink icon={MdMessage} label="Messages" description="Contact the care team" to={`/dashboard/messages/conversation/${patient.id}`} color="#64748B" />
          </div>
        </section>
      )}

      {/* Detail cards */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-[#334155]">Profile Information</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <Detail label="First name" value={formPatient.firstName || 'Not provided'} />
            <Detail label="Last name" value={formPatient.lastName || 'Not provided'} />
            <Detail label="Date of birth" value={patient.dateOfBirth || 'Not provided'} />
            <Detail label="Age" value={calculateAge(patient.dateOfBirth)} />
          </dl>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-[#334155]">Care Team and Emergency Contact</h2>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <Detail label="Doctor assigned" value={patient.doctorName || 'Not assigned'} />
            <Detail label="Nurse assigned" value={patient.nurseName || 'Not assigned'} />
            <Detail label="Caregiver assigned" value={patient.caregiverName || 'Not assigned'} />
            <Detail label="Emergency contact" value={patient.emergencyContactName || 'Not provided'} />
            <Detail label="Emergency phone" value={patient.emergencyContactPhone || 'Not provided'} />
          </dl>
        </Card>
      </section>

      <p className="text-xs text-[#94A3B8]">
        Created {formatDate(patient.createdAt)}
        {patient.updatedAt && patient.updatedAt !== patient.createdAt ? ` · Updated ${formatDate(patient.updatedAt)}` : ''}
      </p>

      <ConfirmDialog
        open={dialog.open}
        title={dialog.type === 'delete' ? 'Archive patient' : 'Deactivate patient'}
        message={dialog.type === 'delete' ? `Archive ${name} where allowed? This preserves healthcare history.` : `Deactivate ${name}?`}
        confirmLabel={dialog.type === 'delete' ? 'Archive' : 'Deactivate'}
        onConfirm={confirmAction}
        onCancel={() => setDialog({ open: false, type: '' })}
      />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[#94A3B8]">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-[#334155]">{value}</dd>
    </div>
  );
}

function CareLink({ icon: Icon, label, description, to, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:border-[#2563EB]/35 hover:bg-[#F8FAFC]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}16`, color }}>
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1E293B]">{label}</p>
        <p className="truncate text-xs text-[#94A3B8]">{description}</p>
      </div>
      <MdArrowForward className="shrink-0 text-[#CBD5E1] transition-colors group-hover:text-[#2563EB]" />
    </Link>
  );
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 'Not available';
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return 'Not available';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age >= 0 ? `${age} years` : 'Not available';
}

export default PatientDetails;
