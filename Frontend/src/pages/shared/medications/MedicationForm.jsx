import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import PatientSelect from '../../../components/common/PatientSelect.jsx';
import StaffSelect from '../../../components/common/StaffSelect.jsx';
import MedicationSafetyDisclaimer from './MedicationSafetyDisclaimer.jsx';

function MedicationForm({ title, description, formData, onChange, onSubmit, submitting, submitLabel, error, patientIdLocked = false }) {
  return (
    <div className="space-y-5">
      <MedicationSafetyDisclaimer />
      <Card className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#334155]">{title}</h1>
          {description && <p className="mt-2 text-sm text-[#334155]/80">{description}</p>}
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <PatientSelect name="patientId" value={formData.patientId} onChange={onChange} required disabled={patientIdLocked} />
            <Input id="medicationName" name="medicationName" label="Medication name" value={formData.medicationName} onChange={onChange} required />
            <Input id="medicationClass" name="medicationClass" label="Medication class" value={formData.medicationClass} onChange={onChange} />
            <Input id="suitableDiabetesType" name="suitableDiabetesType" label="Diabetes type" value={formData.suitableDiabetesType} onChange={onChange} />
          </div>

          <TextArea id="purpose" name="purpose" label="Purpose" value={formData.purpose} onChange={onChange} />
          <TextArea id="doctorPrescribedDose" name="doctorPrescribedDose" label="Doctor prescribed dose" value={formData.doctorPrescribedDose} onChange={onChange} required />
          <TextArea id="medicationSchedule" name="medicationSchedule" label="Medication schedule" value={formData.medicationSchedule} onChange={onChange} />
          <TextArea id="typicalTiming" name="typicalTiming" label="Typical timing" value={formData.typicalTiming} onChange={onChange} />
          <TextArea id="howToUseGeneralInfo" name="howToUseGeneralInfo" label="How to use general information" value={formData.howToUseGeneralInfo} onChange={onChange} />
          <TextArea id="reminderSchedule" name="reminderSchedule" label="Reminder schedule" value={formData.reminderSchedule} onChange={onChange} />
          <TextArea id="commonSideEffects" name="commonSideEffects" label="Common side effects" value={formData.commonSideEffects} onChange={onChange} />
          <TextArea id="storageInstructions" name="storageInstructions" label="Storage instructions" value={formData.storageInstructions} onChange={onChange} />
          <TextArea id="missedDoseGuidance" name="missedDoseGuidance" label="Missed medication guidance" value={formData.missedDoseGuidance} onChange={onChange} />
          <TextArea id="warnings" name="warnings" label="Warnings" value={formData.warnings} onChange={onChange} />

          <div className="grid gap-4 md:grid-cols-3">
            <Input id="startDate" name="startDate" label="Start date" type="date" value={formData.startDate} onChange={onChange} required />
            <Input id="endDate" name="endDate" label="End date" type="date" value={formData.endDate} onChange={onChange} />
            <SelectField label="Adherence status" name="adherenceStatus" value={formData.adherenceStatus} onChange={onChange} options={['PENDING', 'TAKEN', 'MISSED']} />
          </div>

          {error && <p className="rounded-md border border-[#DC2626]/25 bg-[#DC2626]/10 px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function TextArea({ label, id, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#334155]">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className="w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 py-2 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-[#334155]">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="min-h-11 w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MedicationForm;
