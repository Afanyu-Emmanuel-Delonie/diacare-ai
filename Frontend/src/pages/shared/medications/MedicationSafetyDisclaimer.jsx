import AlertBanner from '../../../components/common/AlertBanner.jsx';

function MedicationSafetyDisclaimer() {
  return (
    <AlertBanner
      title="Medication safety disclaimer"
      message="Medication information is for monitoring and reminder purposes only. Do not change medication or dosage without advice from a qualified healthcare professional."
      variant="warning"
      badge="SAFETY"
      noticeId="medication-safety"
    />
  );
}

export default MedicationSafetyDisclaimer;
