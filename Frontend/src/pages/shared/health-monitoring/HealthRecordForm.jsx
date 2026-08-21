import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import Input from '../../../components/common/Input.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { getPatients } from '../../../services/patientService.js';
import { ROLES } from '../../../utils/roles.js';
import {
  buildMonitoringPayload,
  createGlucoseReading,
  createLabResult,
  getGlucoseReading,
  getLabResult,
  monitoringTypes,
  updateGlucoseReading,
  updateLabResult
} from '../../../services/healthMonitoringService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

function HealthRecordForm({ type, mode = 'create' }) {
  const config = monitoringTypes[type];
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userRole } = useAuth();
  const isPatient = userRole === ROLES.PATIENT;
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  const patientIdDefault = isPatient
    ? String(user?.id || '')
    : searchParams.get('patientId') || '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: getDefaultValues(type, patientIdDefault)
  });

  useEffect(() => {
    if (isPatient) return;
    getPatients()
      .then((response) => setPatients(response.data || []))
      .catch(() => setPatients([]));
  }, [isPatient]);

  useEffect(() => {
    if (mode !== 'edit') {
      return;
    }

    const request = config.backendType === 'glucose' ? getGlucoseReading(id) : getLabResult(id);
    request
      .then((response) => reset(toFormValues(type, response.data)))
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load monitoring record.');
        setError(message);
        showToast({ type: 'error', message });
      })
      .finally(() => setLoading(false));
  }, [config.backendType, id, mode, reset, showToast, type]);

  const onSubmit = async (values) => {
    setError('');

    try {
      const payload = buildMonitoringPayload(type, values);
      if (mode === 'edit') {
        if (config.backendType === 'glucose') {
          await updateGlucoseReading(id, payload);
        } else {
          await updateLabResult(id, payload);
        }
        showToast({ type: 'success', message: 'Monitoring record updated successfully.' });
      } else if (config.backendType === 'glucose') {
        await createGlucoseReading(payload);
        showToast({ type: 'success', message: 'Monitoring record created successfully.' });
      } else {
        await createLabResult(payload);
        showToast({ type: 'success', message: 'Monitoring record created successfully.' });
      }

      navigate(`/dashboard/monitoring/${config.route}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to save monitoring record.');
      setError(message);
      showToast({ type: 'error', message });
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading monitoring record..." />;
  }

  if (error && mode === 'edit') {
    return <EmptyState title="Monitoring record could not be loaded" message={error} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">{mode === 'edit' ? `Update ${config.detailTitle}` : config.addTitle}</h1>
        <p className="mt-1 text-[#334155]/80">Record observational monitoring data only. Do not enter AI decisions or clinical diagnosis here.</p>
      </div>

      <Card className="mx-auto max-w-5xl">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            {!isPatient && (
              <SelectField id="patientId" label="Patient" error={errors.patientId?.message} {...register('patientId', { required: 'Patient is required.' })}>
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))}
              </SelectField>
            )}
            {isPatient && (
              <input type="hidden" {...register('patientId')} />
            )}
            {type !== 'glucose' && (
              <SelectField id="unit" label="Unit" error={errors.unit?.message} {...register('unit', { required: 'Unit is required.' })}>
                {config.unitOptions.map((unit) => (
                  <option key={unit || 'none'} value={unit}>
                    {unit || 'Not specified'}
                  </option>
                ))}
              </SelectField>
            )}
          </div>

          {type === 'glucose' && <GlucoseFields register={register} errors={errors} unitOptions={config.unitOptions} />}
          {type === 'bloodPressure' && <BloodPressureFields register={register} errors={errors} />}
          {type === 'weight' && <WeightFields register={register} errors={errors} />}
          {type === 'hba1c' && <Hba1cFields register={register} errors={errors} />}
          {type === 'labs' && <LabFields register={register} errors={errors} />}

          <TextArea id="notes" label="Notes" error={errors.notes?.message} {...register('notes', { maxLength: { value: 500, message: 'Notes must not exceed 500 characters.' } })} />

          {error && <p className="rounded-md border border-[#DC2626]/25 bg-[#DC2626]/10 px-3 py-2 text-sm text-[#DC2626]">{error}</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => navigate(`/dashboard/monitoring/${config.route}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create record'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function GlucoseFields({ register, errors, unitOptions }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="readingValue" label="Reading Value" type="number" step="0.1" error={errors.readingValue?.message} {...register('readingValue', { required: 'Reading value is required.', min: { value: 40, message: 'Minimum value is 40.' }, max: { value: 500, message: 'Maximum value is 500.' } })} />
        <SelectField id="readingType" label="Reading Type" error={errors.readingType?.message} {...register('readingType', { required: 'Reading type is required.' })}>
          {['Fasting', 'Before Meal', 'After Meal', 'Bedtime', 'Random'].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </SelectField>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField id="unit" label="Unit" error={errors.unit?.message} {...register('unit', { required: 'Unit is required.' })}>
          {unitOptions.map((unit) => (
            <option key={unit || 'none'} value={unit}>
              {unit || 'Not specified'}
            </option>
          ))}
        </SelectField>
        <Input id="date" label="Date" type="date" error={errors.date?.message} {...register('date', { required: 'Date is required.' })} />
        <Input id="time" label="Time" type="time" error={errors.time?.message} {...register('time', { required: 'Time is required.' })} />
      </div>
    </>
  );
}

function BloodPressureFields({ register, errors }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Input id="systolic" label="Systolic" type="number" error={errors.systolic?.message} {...register('systolic', { required: 'Systolic value is required.', min: { value: 50, message: 'Minimum is 50.' }, max: { value: 260, message: 'Maximum is 260.' } })} />
        <Input id="diastolic" label="Diastolic" type="number" error={errors.diastolic?.message} {...register('diastolic', { required: 'Diastolic value is required.', min: { value: 30, message: 'Minimum is 30.' }, max: { value: 160, message: 'Maximum is 160.' } })} />
        <Input id="pulseRate" label="Pulse Rate" type="number" error={errors.pulseRate?.message} {...register('pulseRate', { min: { value: 30, message: 'Minimum is 30.' }, max: { value: 220, message: 'Maximum is 220.' } })} />
      </div>
      <DateTimeFields register={register} errors={errors} />
    </>
  );
}

function WeightFields({ register, errors }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="weight" label="Weight" type="number" step="0.1" error={errors.weight?.message} {...register('weight', { required: 'Weight is required.', min: { value: 1, message: 'Minimum is 1.' }, max: { value: 500, message: 'Maximum is 500.' } })} />
        <Input id="bmi" label="BMI" type="number" step="0.1" error={errors.bmi?.message} {...register('bmi')} />
      </div>
      <DateTimeFields register={register} errors={errors} />
    </>
  );
}

function Hba1cFields({ register, errors }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Input id="hba1cPercentage" label="HbA1c Percentage" type="number" step="0.1" error={errors.hba1cPercentage?.message} {...register('hba1cPercentage', { required: 'HbA1c percentage is required.', min: { value: 3, message: 'Minimum is 3.' }, max: { value: 20, message: 'Maximum is 20.' } })} />
        <Input id="laboratoryName" label="Laboratory Name" error={errors.laboratoryName?.message} {...register('laboratoryName')} />
        <Input id="resultDate" label="Result Date" type="date" error={errors.resultDate?.message} {...register('resultDate', { required: 'Result date is required.' })} />
      </div>
      <Input id="testDate" label="Test Date" type="date" error={errors.testDate?.message} {...register('testDate', { required: 'Test date is required.' })} />
    </>
  );
}

function LabFields({ register, errors }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="testName" label="Test Name" error={errors.testName?.message} {...register('testName', { required: 'Test name is required.' })} />
        <Input id="result" label="Result" error={errors.result?.message} {...register('result', { required: 'Result is required.' })} />
        <Input id="referenceRange" label="Reference Range" error={errors.referenceRange?.message} {...register('referenceRange')} />
        <Input id="laboratory" label="Laboratory" error={errors.laboratory?.message} {...register('laboratory')} />
        <Input id="doctor" label="Doctor" error={errors.doctor?.message} {...register('doctor')} />
        <Input id="resultDate" label="Result Date" type="date" error={errors.resultDate?.message} {...register('resultDate', { required: 'Result date is required.' })} />
      </div>
      <Input id="testDate" label="Test Date" type="date" error={errors.testDate?.message} {...register('testDate', { required: 'Test date is required.' })} />
    </>
  );
}

function DateTimeFields({ register, errors }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input id="date" label="Date" type="date" error={errors.date?.message} {...register('date', { required: 'Date is required.' })} />
      <Input id="time" label="Time" type="time" error={errors.time?.message} {...register('time', { required: 'Time is required.' })} />
    </div>
  );
}

function SelectField({ label, id, error, children, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#334155]">{label}</label>
      <select id={id} aria-invalid={Boolean(error)} className="min-h-11 w-full rounded-md border border-[#334155]/30 bg-[#FFFFFF] px-3 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20" {...props}>
        {children}
      </select>
      {error && <p className="text-sm font-medium text-[#DC2626]">{error}</p>}
    </div>
  );
}

function TextArea({ label, id, error, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#334155]">{label}</label>
      <textarea id={id} rows={4} className="w-full rounded-md border border-[#334155]/25 bg-[#FFFFFF] px-3 py-2 text-base text-[#334155] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20" {...props} />
      {error && <p className="text-sm font-medium text-[#DC2626]">{error}</p>}
    </div>
  );
}

function getDefaultValues(type, patientId) {
  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 5);
  const config = monitoringTypes[type];
  return {
    patientId,
    unit: config.defaultUnit,
    readingValue: '',
    readingType: 'Random',
    systolic: '',
    diastolic: '',
    pulseRate: '',
    weight: '',
    bmi: '',
    hba1cPercentage: '',
    laboratoryName: '',
    testName: '',
    result: '',
    referenceRange: '',
    laboratory: '',
    doctor: '',
    notes: '',
    date: today,
    time,
    testDate: today,
    resultDate: today
  };
}

function toFormValues(type, record) {
  const config = monitoringTypes[type];
  const base = getDefaultValues(type, record.patient?.id || record.patientId || '');

  if (config.backendType === 'glucose') {
    const measuredAt = record.measuredAt || '';
    return {
      ...base,
      readingValue: record.reading || '',
      unit: record.unit || config.defaultUnit,
      readingType: record.readingType || 'Random',
      notes: record.notes || '',
      date: measuredAt.slice(0, 10) || base.date,
      time: measuredAt.slice(11, 16) || base.time
    };
  }

  return {
    ...base,
    testName: record.testName || config.testName,
    result: record.result || '',
    unit: record.unit || config.defaultUnit,
    notes: record.notes || '',
    referenceRange: record.referenceRange || '',
    laboratory: record.laboratory || '',
    doctor: record.doctor || '',
    testDate: record.testDate || record.testedOn || base.testDate,
    resultDate: record.resultDate || record.testedOn || base.resultDate
  };
}

export default HealthRecordForm;
