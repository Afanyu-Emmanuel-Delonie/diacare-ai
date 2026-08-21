import { riskScore } from '../../../services/riskPredictionService.js';

export function formatDateTime(value) {
  return value ? value.replace('T', ' ').slice(0, 16) : 'No data available for this section.';
}

export function buildRiskTrend(predictions) {
  return [...predictions]
    .slice()
    .reverse()
    .slice(-12)
    .map((prediction, index) => ({
      label: prediction.predictionDateTime?.slice(5, 10) || `R${index + 1}`,
      value: riskScore(prediction.riskLevel)
    }));
}

export function getPatientOptions(predictions) {
  const values = predictions
    .map((prediction) => prediction.patientName || (prediction.patientId ? `Patient #${prediction.patientId}` : ''))
    .filter(Boolean);
  return ['ALL', ...Array.from(new Set(values)).sort()];
}

export function noData(value) {
  return value === null || value === undefined || value === '' ? 'No data available for this section.' : value;
}
