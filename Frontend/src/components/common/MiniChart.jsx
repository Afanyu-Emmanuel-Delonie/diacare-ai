import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function MiniChart({ data = [], title = 'Trend', valueSuffix = '' }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-[#334155]/15 bg-[#FFFFFF] text-center">
        <div>
          <h3 className="text-sm font-semibold text-[#334155]">No chart data</h3>
          <p className="mt-1 text-sm text-[#334155]/75">No data available for this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full" aria-label={title}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#334155" strokeOpacity={0.12} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#334155', fontSize: 12 }} axisLine={{ stroke: '#334155', strokeOpacity: 0.2 }} tickLine={false} />
          <YAxis tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            contentStyle={{
              border: '1px solid rgba(51, 65, 85, 0.15)',
              borderRadius: '8px',
              color: '#334155'
            }}
            formatter={(value) => [`${value}${valueSuffix}`, title]}
          />
          <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={{ r: 3, fill: '#2563EB' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MiniChart;
