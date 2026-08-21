import apiClient from '../api/axiosConfig.js';

export const getGlucoseReadings = () => apiClient.get('/glucose-readings');

export const getGlucoseReadingsByPatient = (patientId) => apiClient.get(`/glucose-readings/patient/${patientId}`);

export const getGlucoseReading = (id) => apiClient.get(`/glucose-readings/${id}`);

export const createGlucoseReading = (payload) => apiClient.post('/glucose-readings', payload);

export const updateGlucoseReading = (id, payload) => apiClient.put(`/glucose-readings/${id}`, payload);

export const getLabResults = () => apiClient.get('/lab-results');

export const getLabResult = (id) => apiClient.get(`/lab-results/${id}`);

export const createLabResult = (payload) => apiClient.post('/lab-results', payload);

export const updateLabResult = (id, payload) => apiClient.put(`/lab-results/${id}`, payload);

export const monitoringTypes = {
  glucose: {
    title: 'Blood Glucose Records',
    addTitle: 'Add Blood Glucose Reading',
    detailTitle: 'Blood Glucose Details',
    route: 'glucose',
    recordKind: 'glucose',
    backendType: 'glucose',
    unitOptions: ['mg/dL', 'mmol/L'],
    defaultUnit: 'mg/dL',
    testName: 'Blood Glucose'
  },
  bloodPressure: {
    title: 'Blood Pressure Records',
    addTitle: 'Add Blood Pressure Reading',
    detailTitle: 'Blood Pressure Details',
    route: 'blood-pressure',
    recordKind: 'bloodPressure',
    backendType: 'lab',
    unitOptions: ['mmHg'],
    defaultUnit: 'mmHg',
    testName: 'Blood Pressure'
  },
  weight: {
    title: 'Weight Records',
    addTitle: 'Add Weight Record',
    detailTitle: 'Weight Details',
    route: 'weight',
    recordKind: 'weight',
    backendType: 'lab',
    unitOptions: ['kg', 'lb'],
    defaultUnit: 'kg',
    testName: 'Weight'
  },
  hba1c: {
    title: 'HbA1c Results',
    addTitle: 'Add HbA1c Result',
    detailTitle: 'HbA1c Result Details',
    route: 'hba1c',
    recordKind: 'hba1c',
    backendType: 'lab',
    unitOptions: ['%'],
    defaultUnit: '%',
    testName: 'HbA1c'
  },
  labs: {
    title: 'Laboratory Results',
    addTitle: 'Add Laboratory Result',
    detailTitle: 'Laboratory Result Details',
    route: 'labs',
    recordKind: 'labs',
    backendType: 'lab',
    unitOptions: ['', 'mg/dL', 'mmol/L', '%', 'g/dL'],
    defaultUnit: '',
    testName: ''
  }
};

export function normalizeMonitoringRecord(record, type) {
  const config = monitoringTypes[type];

  if (config.backendType === 'glucose') {
    return {
      id: record.id,
      type,
      label: config.testName,
      patientId: record.patient?.id || record.patientId,
      patientName: record.patient?.fullName || record.patientName || 'Accessible patient',
      recordedBy: record.recordedBy || 'Not available',
      value: record.reading,
      unit: record.unit || config.defaultUnit,
      status: record.status || 'RECORDED',
      readingType: record.readingType || 'Not provided',
      notes: record.notes || 'No notes recorded.',
      dateTime: record.measuredAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt || record.createdAt,
      raw: record
    };
  }

  return {
    id: record.id,
    type,
    label: record.testName || config.testName || 'Laboratory Result',
    patientId: record.patient?.id || record.patientId,
    patientName: record.patient?.fullName || record.patientName || 'Accessible patient',
    recordedBy: record.recordedBy || record.doctorName || 'Not available',
    value: record.result,
    unit: record.unit || config.defaultUnit,
    status: record.status || 'RECORDED',
    notes: record.notes || 'No notes recorded.',
    referenceRange: record.referenceRange || 'Not provided',
    laboratory: record.laboratory || 'Not provided',
    doctor: record.doctor || record.doctorName || 'Not provided',
    dateTime: record.resultDate || record.testedOn,
    testDate: record.testDate || record.testedOn,
    resultDate: record.resultDate || record.testedOn,
    createdAt: record.createdAt || record.testedOn,
    updatedAt: record.updatedAt || record.testedOn,
    raw: record
  };
}

export function buildMonitoringPayload(type, values) {
  const config = monitoringTypes[type];

  if (config.backendType === 'glucose') {
    return {
      reading: Number(values.readingValue),
      unit: values.unit,
      readingType: values.readingType,
      notes: values.notes || null,
      measuredAt: `${values.date}T${values.time}`,
      patient: { id: Number(values.patientId) }
    };
  }

  return {
    testName: type === 'labs' ? values.testName : config.testName,
    result: buildLabResultValue(type, values),
    unit: values.unit || config.defaultUnit,
    referenceRange: values.referenceRange || null,
    laboratory: values.laboratory || values.laboratoryName || null,
    doctor: values.doctor || null,
    notes: values.notes || null,
    testDate: values.testDate || values.date,
    resultDate: values.resultDate || values.date,
    testedOn: values.resultDate || values.testDate || values.date,
    patient: { id: Number(values.patientId) }
  };
}

function buildLabResultValue(type, values) {
  if (type === 'bloodPressure') {
    return `${values.systolic}/${values.diastolic}${values.pulseRate ? ` pulse ${values.pulseRate}` : ''}`;
  }

  if (type === 'weight') {
    return `${values.weight}${values.bmi ? ` BMI ${values.bmi}` : ''}`;
  }

  if (type === 'hba1c') {
    return values.hba1cPercentage;
  }

  return values.result;
}
