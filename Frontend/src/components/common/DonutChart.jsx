import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

function DonutChart({ data = [], centerLabel, size = 168 }) {
  const total = data.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);

  if (!total) {
    return (
      <div className="flex h-44 items-center justify-center text-center">
        <p className="text-sm text-[#94A3B8]">No data available for this section.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Decorative — the list below gives the same breakdown as accessible text. */}
      <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '12px' }} formatter={(value, name) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#0F172A]">{total}</span>
          {centerLabel && <span className="text-[11px] text-[#94A3B8]">{centerLabel}</span>}
        </div>
      </div>

      <ul className="flex w-full flex-col gap-2.5 sm:max-w-[180px]">
        {data.map((entry) => (
          <li key={entry.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
              <span className="truncate text-[#475569]">{entry.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-[#0F172A]">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DonutChart;
