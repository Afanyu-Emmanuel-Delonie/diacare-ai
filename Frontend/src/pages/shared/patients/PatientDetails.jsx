import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  MdArrowForward,
  MdCalendarMonth,
  MdFolderOpen,
  MdMedication,
  MdMessage,
  MdMonitorHeart,
  MdPsychology,
  MdSummarize,
  MdPerson,
  MdPhone,
  MdEmail,
  MdCake,
  MdLocalHospital,
  MdContactPhone,
  MdContactEmergency,
  MdSchedule,
} from 'react-icons/md';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import Modal from '../../../components/common/Modal.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  deactivatePatient, deletePatient, getPatient,
  getPatientDisplayName, getPatientInitialFormData, getPatientStatus,
} from '../../../services/patientService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import PatientProfileSummary from './PatientProfileSummary.jsx';

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: '' });
  const [detailsOpen, setDetailsOpen] = useState(false);

  const canDelete = userRole === ROLES.ADMIN;
  const canDeactivate = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE].includes(userRole);
  const canEdit = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT].includes(userRole);
  const isCaregiver = userRole === ROLES.CAREGIVER;

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

  return (
    <div className="space-y-6">
      <PatientProfileSummary patient={patient} />

      {/* Caregiver: care overview + view details button */}
      {isCaregiver && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#1e293b]">Patient care overview</h2>
              <p className="mt-0.5 text-sm text-[#64748b]">Open the information you need to support this patient.</p>
            </div>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[#334155]/15 bg-white px-4 py-2 text-sm font-semibold text-[#334155] shadow-sm transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <MdPerson size={16} /> View details
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CareLink icon={MdMonitorHeart} label="Health monitoring" description="Readings and health timeline" to={`/dashboard/monitoring?patientId=${patient.id}`} color="#2563EB" />
            <CareLink icon={MdMedication} label="Medications" description="Schedule and adherence" to={`/dashboard/medications?patientId=${patient.id}`} color="#F59E0B" />
            <CareLink icon={MdCalendarMonth} label="Appointments" description="Upcoming visits and history" to={`/dashboard/appointments?patientId=${patient.id}`} color="#0EA5E9" />
            <CareLink icon={MdPsychology} label="Risk alerts" description="Abnormal and urgent alerts" to={`/dashboard/ai-risk/patient-summary?patientId=${patient.id}`} color="#DC2626" />
            <CareLink icon={MdFolderOpen} label="Medical history" description="Care notes and records" to={`/dashboard/medical-records/history?patientEmail=${encodeURIComponent(patient.email)}`} color="#8B5CF6" />
            <CareLink icon={MdSummarize} label="Care report" description="Caregiver patient report" to={`/dashboard/reports/caregiver/patient?patientId=${patient.id}`} color="#10B981" />
            <CareLink icon={MdMessage} label="Messages" description="Contact the care team" to={`/dashboard/messages/conversation/${patient.id}`} color="#64748B" />
          </div>
        </section>
      )}

      {/* Non-caregiver: action buttons */}
      {!isCaregiver && (
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/patients">
            <Button variant="secondary">Back to patients</Button>
          </Link>
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
      )}

      {/* Non-caregiver: detail cards */}
      {!isCaregiver && (
        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <h2 className="text-base font-semibold text-[#334155]">Profile Information</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail label="Patient ID" value={patient.patientCode || 'Not available'} />
              <Detail label="First name" value={formPatient.firstName || 'Not provided'} />
              <Detail label="Last name" value={formPatient.lastName || 'Not provided'} />
              <Detail label="Email" value={patient.email || 'Not provided'} />
              <Detail label="Phone number" value={patient.phone || 'Not provided'} />
              <Detail label="Date of birth" value={patient.dateOfBirth || 'Not provided'} />
              <Detail label="Age" value={calculateAge(patient.dateOfBirth)} />
              <Detail label="Diabetes type" value={<Badge variant="info">{patient.diabetesType || 'Not specified'}</Badge>} />
              <Detail label="Status" value={<Badge variant={status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'warning' : 'critical'}>{status}</Badge>} />
            </dl>
          </Card>
          <Card>
            <h2 className="text-base font-semibold text-[#334155]">Care and Emergency Contacts</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail label="Emergency contact" value={patient.emergencyContactName || 'Not provided'} />
              <Detail label="Emergency phone" value={patient.emergencyContactPhone || 'Not provided'} />
              <Detail label="Doctor assigned" value={patient.doctorName || 'Not assigned'} />
              <Detail label="Nurse assigned" value={patient.nurseName || 'Not assigned'} />
              <Detail label="Caregiver assigned" value={patient.caregiverName || 'Not assigned'} />
              <Detail label="Created date" value={formatDate(patient.createdAt)} />
              <Detail label="Updated date" value={formatDate(patient.updatedAt)} />
            </dl>
          </Card>
        </section>
      )}

      {/* Caregiver: patient details modal */}
      <Modal open={detailsOpen} title="Patient Details" onClose={() => setDetailsOpen(false)}>
        <div className="space-y-5">
          {/* Profile section */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Profile</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModalDetail icon={MdPerson} label="Full name" value={getPatientDisplayName(patient)} />
              <ModalDetail icon={MdEmail} label="Email" value={patient.email || 'Not provided'} />
              <ModalDetail icon={MdPhone} label="Phone" value={patient.phone || 'Not provided'} />
              <ModalDetail icon={MdCake} label="Date of birth" value={patient.dateOfBirth || 'Not provided'} />
              <ModalDetail icon={MdPerson} label="Age" value={calculateAge(patient.dateOfBirth)} />
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9]">
                  <MdLocalHospital size={14} className="text-[#64748b]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#94a3b8]">Diabetes type</p>
                  <Badge variant="info">{patient.diabetesType || 'Not specified'}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f1f5f9]" />

          {/* Care team section */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Care team</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModalDetail icon={MdLocalHospital} label="Doctor assigned" value={patient.doctorName || 'Not assigned'} />
              <ModalDetail icon={MdLocalHospital} label="Nurse assigned" value={patient.nurseName || 'Not assigned'} />
              <ModalDetail icon={MdPerson} label="Caregiver assigned" value={patient.caregiverName || 'Not assigned'} />
            </div>
          </div>

          <div className="border-t border-[#f1f5f9]" />

          {/* Emergency section */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Emergency contact</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModalDetail icon={MdContactEmergency} label="Contact name" value={patient.emergencyContactName || 'Not provided'} />
              <ModalDetail icon={MdContactPhone} label="Contact phone" value={patient.emergencyContactPhone || 'Not provided'} />
            </div>
          </div>

          <div className="border-t border-[#f1f5f9]" />

          {/* Timestamps */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Record</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModalDetail icon={MdSchedule} label="Created" value={formatDate(patient.createdAt)} />
              <ModalDetail icon={MdSchedule} label="Last updated" value={formatDate(patient.updatedAt)} />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={dialog.open}
        title={dialog.type === 'delete' ? 'Archive patient' : 'Deactivate patient'}
        message={dialog.type === 'delete' ? `Archive ${getPatientDisplayName(patient)} where allowed? This preserves healthcare history.` : `Deactivate ${getPatientDisplayName(patient)}?`}
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
      <dt className="text-sm font-semibold text-[#334155]/70">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-[#334155]">{value}</dd>
    </div>
  );
}

function ModalDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9]">
        <Icon size={14} className="text-[#64748b]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#94a3b8]">{label}</p>
        <p className="truncate text-sm font-semibold text-[#334155]">{value}</p>
      </div>
    </div>
  );
}

function CareLink({ icon: Icon, label, description, to, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1E293B]">{label}</p>
        <p className="mt-0.5 text-xs text-[#94A3B8]">{description}</p>
      </div>
      <MdArrowForward className="shrink-0 text-[#CBD5E1] transition-colors group-hover:text-[#2563EB]" />
    </Link>
  );
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString();
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
