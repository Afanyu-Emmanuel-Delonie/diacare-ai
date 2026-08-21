import NotificationModulePage from './NotificationModulePage.jsx';

function EmergencyAlerts() {
  return (
    <NotificationModulePage
      title="Emergency Alerts"
      eyebrow="Emergency"
      description="View critical emergency alerts that may require urgent attention."
      fixedCategory="EMERGENCY_ALERT"
      criticalOnly
      banner={{
        title: 'Emergency alert guidance',
        message: 'Emergency alerts should be reviewed promptly. Follow the care plan from a qualified healthcare professional or contact emergency services when urgent symptoms are present.',
        variant: 'critical',
        badge: 'URGENT'
      }}
    />
  );
}

export default EmergencyAlerts;
