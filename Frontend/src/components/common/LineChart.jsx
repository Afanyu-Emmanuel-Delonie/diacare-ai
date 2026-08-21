import Card from './Card.jsx';

function LineChart({ title, data = [], valueSuffix = '' }) {
  const values = data.map((item) => item.value);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const range = maxValue - minValue || 1;
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 90 - ((item.value - minValue) / range) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
        {data.length > 0 && (
          <p className="text-sm font-semibold text-[#2563EB]">
            {data[data.length - 1].value}
            {valueSuffix}
          </p>
        )}
      </div>
      <div className="mt-5">
        <svg viewBox="0 0 100 100" role="img" aria-label={title} className="h-48 w-full">
          <line x1="0" y1="90" x2="100" y2="90" stroke="#334155" strokeOpacity="0.18" strokeWidth="1" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeOpacity="0.10" strokeWidth="1" />
          <polyline points={points} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((item, index) => {
            const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
            const y = 90 - ((item.value - minValue) / range) * 70;

            return <circle key={item.label} cx={x} cy={y} r="2.4" fill="#2563EB" />;
          })}
        </svg>
        <div className="grid grid-cols-4 gap-2 text-xs font-medium text-[#334155]/70 sm:grid-cols-6">
          {data.map((item) => (
            <span key={item.label}>{item.label}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default LineChart;
