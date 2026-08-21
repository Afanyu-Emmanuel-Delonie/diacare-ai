import { useEffect, useState } from 'react';
import { getPatients, getPatientDisplayName } from '../../services/patientService.js';
import useAuth from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/roles.js';

function PatientSelect({ value, onChange, name = 'patientId', label = 'Patient', required = false, disabled = false, error }) {
  const { userRole, user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Patients never see a patient selector — their own ID is used automatically
  const isPatient = userRole === ROLES.PATIENT;

  useEffect(() => {
    if (isPatient) { setLoading(false); return; }
    let mounted = true;
    getPatients()
      .then((res) => { if (mounted) setPatients(Array.isArray(res.data) ? res.data : []); })
      .catch(() => { if (mounted) setPatients([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [isPatient]);

  // For patient role: emit their own id once and render nothing visible
  useEffect(() => {
    if (isPatient && user?.id) {
      onChange({ target: { name, value: String(user.id) } });
    }
  }, [isPatient, user?.id]);

  if (isPatient) return null;

  const handleChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-[#334155]">
        {label}{required && <span className="ml-0.5 text-[#DC2626]">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled || loading}
        aria-invalid={Boolean(error)}
        className="min-h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-70"
      >
        <option value="">{loading ? 'Loading patients…' : 'Select patient'}</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {getPatientDisplayName(p)}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-[#DC2626]">{error}</p>}
    </div>
  );
}

export default PatientSelect;
