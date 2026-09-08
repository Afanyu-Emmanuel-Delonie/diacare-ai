import apiClient from '../api/axiosConfig.js';

const historyKey = 'aiRiskPredictionHistory';

export const riskLevels = ['LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK', 'EMERGENCY_RISK'];

export const riskTypes = ['GLUCOSE', 'HBA1C', 'MEDICATION_ADHERENCE', 'REPEATED_ABNORMAL_READINGS', 'EMERGENCY'];

export const aiRiskDisclaimer =
  'This AI-supported information is for monitoring and educational purposes only. It does not replace diagnosis, treatment, or advice from a qualified healthcare professional.';

export const safeGuidanceExamples = [
  "Your reading appears outside the expected range. Please follow your healthcare provider's advice.",
  'Repeated abnormal readings were detected. Consider contacting your healthcare provider.',
  'Emergency-level risk may require urgent medical attention.'
];

export const predictRisk = (payload) => apiClient.post('/risk-predictions', payload);

export const getRiskPredictions = async () => {
  const response = await apiClient.get('/risk-predictions');
  const remote = (response.data || []).map(normalizeRiskPrediction);
  return { ...response, data: mergePredictions(remote, getStoredRiskPredictions()) };
};

export const getRiskPredictionsByPatient = async (patientId) => {
  const response = await apiClient.get(`/risk-predictions/patient/${patientId}`);
  const remote = (response.data || []).map(normalizeRiskPrediction);
  const local = getStoredRiskPredictions().filter(
    (prediction) => String(prediction.patientId || '') === String(patientId)
  );
  return { ...response, data: mergePredictions(remote, local) };
};

export const getRiskPrediction = async (id) => {
  const local = getStoredRiskPredictions().find((prediction) => String(prediction.id) === String(id));
  if (local) return { data: local };
  const response = await apiClient.get(`/risk-predictions/${id}`);
  return { ...response, data: normalizeRiskPrediction(response.data) };
};

function mergePredictions(remote, local) {
  const byId = new Map([...remote, ...local].map((prediction) => [String(prediction.id), prediction]));
  return [...byId.values()].sort(
    (left, right) => String(right.predictedAt || '').localeCompare(String(left.predictedAt || ''))
  );
}

export function saveGeneratedRiskPrediction(result, input = {}) {
  const prediction = normalizeRiskPrediction({
    id: crypto.randomUUID(),
    patientId: input.patientId || '',
    patientName: input.patientName || '',
    riskCategory: result.riskCategory,
    riskLevel: result.riskLevel,
    triggeredSignals: result.triggeredSignals || [],
    alertMessage: result.alertMessage,
    recommendedActionText: result.recommendedActionText || result.alertMessage,
    bloodGlucoseValue: input.currentReading,
    hba1cValue: input.hba1cResult,
    medicationAdherenceRisk: input.medicationAdherenceMissed ? 'Missed medication risk' : '',
    repeatedAbnormalReadings: countAbnormalReadings(input.recentReadings || []),
    predictedAt: new Date().toISOString(),
    predictionDateTime: new Date().toISOString(),
    riskType: inferRiskType(result.triggeredSignals || [], result.riskCategory),
    reviewedByDoctor: false,
    doctorReviewStatus: 'PENDING',
    doctorComment: ''
  });
  const nextHistory = [prediction, ...getStoredRiskPredictions()].slice(0, 100);
  localStorage.setItem(historyKey, JSON.stringify(nextHistory));
  return prediction;
}

export function getStoredRiskPredictions() {
  try {
    return JSON.parse(localStorage.getItem(historyKey) || '[]').map(normalizeRiskPrediction);
  } catch {
    return [];
  }
}

export function normalizeRiskPrediction(prediction = {}) {
  const riskLevel = normalizeRiskLevel(prediction.riskLevel || prediction.riskCategory);
  const triggeredSignals = prediction.triggeredSignals || prediction.signals || [];
  return {
    ...prediction,
    id: prediction.id || crypto.randomUUID(),
    patientId: prediction.patientId || prediction.patient?.id || '',
    patientName: prediction.patientName || prediction.patient?.fullName || prediction.patient?.name || 'No data available for this section.',
    riskLevel,
    riskCategory: riskLevel,
    riskType: prediction.riskType || inferRiskType(triggeredSignals, riskLevel),
    bloodGlucoseValue: prediction.bloodGlucoseValue ?? prediction.currentReading ?? prediction.input?.currentReading ?? '',
    hba1cValue: prediction.hba1cValue ?? prediction.hba1cResult ?? prediction.input?.hba1cResult ?? '',
    medicationAdherenceRisk: prediction.medicationAdherenceRisk || (prediction.input?.medicationAdherenceMissed ? 'Missed medication risk' : ''),
    repeatedAbnormalReadings: prediction.repeatedAbnormalReadings ?? countAbnormalReadings(prediction.input?.recentReadings || []),
    triggeredSignals,
    aiExplanation: prediction.aiExplanation || prediction.reason || prediction.alertMessage || 'No data available for this section.',
    recommendedActionText: prediction.recommendedActionText || prediction.recommendationSummary || prediction.alertMessage || aiRiskDisclaimer,
    predictionDateTime: prediction.predictionDateTime || prediction.predictedAt || prediction.createdAt || new Date().toISOString(),
    predictedAt: prediction.predictedAt || prediction.predictionDateTime || prediction.createdAt || new Date().toISOString(),
    reviewedByDoctor: Boolean(prediction.reviewedByDoctor || prediction.doctorReviewed),
    doctorReviewStatus: prediction.doctorReviewStatus || (prediction.reviewedByDoctor || prediction.doctorReviewed ? 'REVIEWED' : 'PENDING'),
    doctorComment: prediction.doctorComment || prediction.doctorReview || prediction.reviewComment || ''
  };
}

export function filterRiskPredictions(predictions, filters) {
  const search = String(filters.search || '').trim().toLowerCase();
  return predictions.filter((prediction) => {
    const date = getRiskDate(prediction);
    const matchesSearch =
      !search ||
      prediction.patientName?.toLowerCase().includes(search) ||
      prediction.riskType?.toLowerCase().includes(search) ||
      prediction.aiExplanation?.toLowerCase().includes(search) ||
      prediction.recommendedActionText?.toLowerCase().includes(search);
    const matchesPatient = !filters.patient || filters.patient === 'ALL' || String(prediction.patientId) === String(filters.patient) || prediction.patientName === filters.patient;
    const matchesLevel = !filters.riskLevel || filters.riskLevel === 'ALL' || prediction.riskLevel === filters.riskLevel;
    const matchesType = !filters.riskType || filters.riskType === 'ALL' || prediction.riskType === filters.riskType;
    const matchesFrom = !filters.dateFrom || date >= filters.dateFrom;
    const matchesTo = !filters.dateTo || date <= filters.dateTo;

    return matchesSearch && matchesPatient && matchesLevel && matchesType && matchesFrom && matchesTo;
  });
}

export function getRiskDate(prediction) {
  return prediction?.predictionDateTime?.slice(0, 10) || prediction?.predictedAt?.slice(0, 10) || '';
}

export function normalizeRiskLevel(value) {
  const normalized = String(value || 'LOW_RISK').toUpperCase();
  if (normalized.includes('EMERGENCY')) return 'EMERGENCY_RISK';
  if (normalized.includes('HIGH')) return 'HIGH_RISK';
  if (normalized.includes('MODERATE')) return 'MODERATE_RISK';
  return 'LOW_RISK';
}

export function riskBadgeVariant(level) {
  const normalized = normalizeRiskLevel(level);
  if (normalized === 'LOW_RISK') return 'success';
  if (normalized === 'MODERATE_RISK') return 'warning';
  if (normalized === 'HIGH_RISK' || normalized === 'EMERGENCY_RISK') return 'critical';
  return 'info';
}

export function riskScore(level) {
  const normalized = normalizeRiskLevel(level);
  if (normalized === 'EMERGENCY_RISK') return 4;
  if (normalized === 'HIGH_RISK') return 3;
  if (normalized === 'MODERATE_RISK') return 2;
  return 1;
}

export function formatRiskLevel(level) {
  return normalizeRiskLevel(level).replaceAll('_', ' ');
}

export function parseRecentReadings(value) {
  if (Array.isArray(value)) {
    return value.map(Number).filter(Number.isFinite);
  }

  if (!String(value || '').trim()) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => Number(item.trim()))
    .filter(Number.isFinite);
}

export function isAbnormalReading(value) {
  return Number.isFinite(Number(value)) && (Number(value) < 70 || Number(value) > 180);
}

export function countAbnormalReadings(readings) {
  return parseRecentReadings(readings).filter(isAbnormalReading).length;
}

export function inferRiskType(signals = [], riskLevel = '') {
  const signalText = signals.join(' ').toLowerCase();
  if (normalizeRiskLevel(riskLevel) === 'EMERGENCY_RISK') return 'EMERGENCY';
  if (signalText.includes('medication')) return 'MEDICATION_ADHERENCE';
  if (signalText.includes('repeated')) return 'REPEATED_ABNORMAL_READINGS';
  if (signalText.includes('hba1c')) return 'HBA1C';
  return 'GLUCOSE';
}

export function safeRiskText(text) {
  const fallback = aiRiskDisclaimer;
  const value = String(text || fallback);
  const unsafePatterns = [/take this medicine/i, /increase .*dose/i, /you have .*disease/i, /ignore your doctor/i, /diagnosed with/i];

  if (unsafePatterns.some((pattern) => pattern.test(value))) {
    return fallback;
  }

  return value;
}
