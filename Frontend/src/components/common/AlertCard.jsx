import Badge from './Badge.jsx';

const variants = {
  LOW: 'success',
  NORMAL: 'success',
  MODERATE: 'warning',
  WARNING: 'warning',
  HIGH: 'critical',
  CRITICAL: 'critical',
  EMERGENCY: 'critical',
  INFO: 'info'
};

function AlertCard({ title, message, level = 'INFO', time }) {
  const normalizedLevel = String(level || 'INFO').toUpperCase();
  const variantKey = normalizedLevel.includes('EMERGENCY')
    ? 'EMERGENCY'
    : normalizedLevel.includes('HIGH')
      ? 'HIGH'
      : normalizedLevel.includes('MODERATE')
        ? 'MODERATE'
        : normalizedLevel.includes('LOW')
          ? 'LOW'
          : normalizedLevel;

  return (
    <article className="space-y-3 rounded-lg border border-[#334155]/15 bg-[#FFFFFF] p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#334155]">{title}</h3>
        <Badge variant={variants[variantKey] || 'info'}>{normalizedLevel}</Badge>
      </div>
      <p className="text-sm text-[#334155]/80">{message || 'No data available for this section.'}</p>
      {time && <p className="text-xs font-medium text-[#334155]/65">{time}</p>}
    </article>
  );
}

export default AlertCard;
