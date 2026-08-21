import Card from './Card.jsx';

function BarChart({ title, data = [], valueSuffix = '' }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
      <div className="mt-5 space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-[#334155]">{item.label}</span>
              <span className="font-semibold text-[#334155]">
                {item.value}
                {valueSuffix}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#334155]/10">
              <div
                className="h-3 rounded-full bg-[#2563EB]"
                style={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default BarChart;
