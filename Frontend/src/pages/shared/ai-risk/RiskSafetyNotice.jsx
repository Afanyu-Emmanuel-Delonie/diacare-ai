import AlertBanner from '../../../components/common/AlertBanner.jsx';
import { aiRiskDisclaimer } from '../../../services/riskPredictionService.js';

function RiskSafetyNotice() {
  return (
    <AlertBanner
      title="AI-supported risk prediction safety notice"
      message={aiRiskDisclaimer}
      variant="info"
      badge="SAFETY"
      noticeId="ai-risk-safety"
    />
  );
}

export default RiskSafetyNotice;
