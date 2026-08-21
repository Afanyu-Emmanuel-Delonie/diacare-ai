import NotificationModulePage from './NotificationModulePage.jsx';

function AiRiskAlerts() {
  return (
    <NotificationModulePage
      title="AI-supported Risk Alerts"
      eyebrow="AI-supported Alerts"
      description="View AI-supported risk alerts from the backend. These alerts support monitoring only and do not replace professional medical care."
      fixedCategory="AI_RISK_ALERT"
      banner={{
        title: 'AI-supported alert safety notice',
        message: 'This information supports monitoring only. It does not diagnose, prescribe medication, recommend exact dosage, or replace advice from a qualified healthcare professional.',
        variant: 'info',
        badge: 'SAFETY'
      }}
    />
  );
}

export default AiRiskAlerts;
