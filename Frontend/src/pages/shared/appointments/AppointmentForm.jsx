import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import PatientSelect from '../../../components/common/PatientSelect.jsx';
import StaffSelect from '../../../components/common/StaffSelect.jsx';
import { appointmentStatuses, appointmentTypes } from '../../../services/appointmentService.js';

function AppointmentForm({ title, description, formData, onChange, onSubmit, submitting, submitLabel, error, patientIdLocked = false, statusReadOnly = false }) {
  return (
    <Card className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#334155]">{title}</h1>
        {description && <p className="mt-2 text-sm text-[#334155]/80">{description}</p>}
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <PatientSelect name="patientId" value={formData.patientId} onChange={onChange} required disabled={patientIdLocked} />
          <StaffSelect name="doctorId" label="Doctor" role="DOCTOR" value={formData.doctorId || ''} onChange={onChange} />
          <StaffSelect name="nurseId" label="Nurse" role="NURSE" value={formData.nurseId || ''} onChange={onChange} />
          <Input id="scheduledAt" name="scheduledAt" label="Appointment date and time" type="datetime-local" value={formData.scheduledAt} onChange={onChange} required />
          <SelectField label="Appointment type" name="appointmentType" value={formData.appointmentType} onChange={onChange} options={appointmentTypes} />
          <Input id="location" name="location" label="Location or consultation mode" value={formData.location} onChange={onChange} placeholder="Clinic, hospital, phone, or online" />
          <Input id="reminderAt" name="reminderAt" label="Reminder date and time" type="datetime-local" value={formData.reminderAt} onChange={onChange} />
          <SelectStatus value={formData.status} onChange={onChange} disabled={statusReadOnly} />
        </div>

        <div className="space-y-2">
          <label htmlFor="reason" className="block text-sm font-semibold text-[#334155]">Reason</label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            value={formData.reason}
            onChange={onChange}
            className="w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 py-2 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-semibold text-[#334155]">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ''}
            onChange={onChange}
            className="w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 py-2 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        {error && <p className="rounded-md border border-[#DC2626]/25 bg-[#DC2626]/10 px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
}

function SelectStatus({ value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label htmlFor="status" className="block text-sm font-semibold text-[#334155]">Status</label>
      <select
        id="status"
        name="status"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-70"
      >
        {appointmentStatuses.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-[#334155]">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
      >
        <option value="">Select type</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default AppointmentForm;
