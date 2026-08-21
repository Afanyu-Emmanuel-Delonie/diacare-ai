import { MdEmail, MdPhone, MdLocalHospital, MdContactPhone } from 'react-icons/md';
import Badge from '../../../components/common/Badge.jsx';
import { getPatientDisplayName, getPatientStatus } from '../../../services/patientService.js';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function PatientProfileSummary({ patient }) {
  const status = getPatientStatus(patient);
  const name = getPatientDisplayName(patient);

  return (
    <div className="rounded-xl border border-[#334155]/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-xl font-bold text-[#2563EB]">
          {getInitials(name)}
        </div>

        {/* Name + badges + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'warning' : 'critical'}>{status}</Badge>
            <Badge variant="info">{patient.diabetesType || 'Diabetes type not specified'}</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[#1e293b]">{name}</h1>
          <p className="mt-0.5 text-sm text-[#64748b]">Patient ID: {patient.id || 'Not available'}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem icon={MdEmail} label="Email" value={patient.email || 'Not provided'} />
            <InfoItem icon={MdPhone} label="Phone" value={patient.phone || 'Not provided'} />
            <InfoItem icon={MdLocalHospital} label="Doctor" value={patient.doctorName || 'Not assigned'} />
            <InfoItem icon={MdContactPhone} label="Emergency" value={patient.emergencyContactPhone || 'Not provided'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
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

export default PatientProfileSummary;
