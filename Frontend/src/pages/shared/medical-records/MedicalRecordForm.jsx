import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import Input from '../../../components/common/Input.jsx';
import PatientSelect from '../../../components/common/PatientSelect.jsx';

const statuses = ['ACTIVE', 'UNDER_REVIEW', 'ARCHIVED'];
const diabetesTypes = ['', 'TYPE_1', 'TYPE_2', 'GESTATIONAL', 'PREDIABETES', 'OTHER'];

function MedicalRecordForm({ title, description, formData, onChange, onSubmit, submitting, submitLabel, error, patientIdLocked = false }) {
  return (
    <Card className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#334155]">{title}</h1>
        {description && <p className="mt-2 text-sm text-[#334155]/80">{description}</p>}
        <p className="mt-2 text-xs font-medium text-[#334155]/60">Recorded by you, timestamped automatically on save.</p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <PatientSelect name="patientId" value={formData.patientId} onChange={onChange} required disabled={patientIdLocked} />
          <SelectField label="Diabetes type" name="diabetesType" value={formData.diabetesType} onChange={onChange} options={diabetesTypes} />
          <SelectField label="Status" name="status" value={formData.status} onChange={onChange} options={statuses} />
        </div>

        <Input id="diagnosis" name="diagnosis" label="Diagnosis" value={formData.diagnosis} onChange={onChange} required />
        <TextArea id="allergies" name="allergies" label="Allergies" value={formData.allergies} onChange={onChange} />
        <TextArea id="symptoms" name="symptoms" label="Symptoms" value={formData.symptoms} onChange={onChange} />
        <TextArea id="treatmentPlan" name="treatmentPlan" label="Treatment plan summary" value={formData.treatmentPlan} onChange={onChange} />
        <TextArea id="notes" name="notes" label="Medical history notes" value={formData.notes} onChange={onChange} required />
        <TextArea id="doctorNotes" name="doctorNotes" label="Doctor notes" value={formData.doctorNotes} onChange={onChange} />

        {error && <p className="rounded-md border border-[#DC2626]/25 bg-[#DC2626]/10 px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
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
          <option key={option || 'none'} value={option}>
            {option || 'Not specified'}
          </option>
        ))}
      </select>
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
        rows={4}
        className="w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 py-2 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        {...props}
      />
    </div>
  );
}

export default MedicalRecordForm;
