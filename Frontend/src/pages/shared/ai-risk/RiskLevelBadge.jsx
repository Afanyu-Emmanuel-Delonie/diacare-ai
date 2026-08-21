import Badge from '../../../components/common/Badge.jsx';
import { formatRiskLevel, riskBadgeVariant } from '../../../services/riskPredictionService.js';

function RiskLevelBadge({ level }) {
  return <Badge variant={riskBadgeVariant(level)}>{formatRiskLevel(level)}</Badge>;
}

export default RiskLevelBadge;
