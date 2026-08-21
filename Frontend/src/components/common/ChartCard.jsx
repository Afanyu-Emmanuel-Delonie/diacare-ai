import Card from './Card.jsx';
import MiniChart from './MiniChart.jsx';

function ChartCard({ title, description, data, valueSuffix = '' }) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[#334155]/75">{description}</p>}
      </div>
      <MiniChart data={data} title={title} valueSuffix={valueSuffix} />
    </Card>
  );
}

export default ChartCard;
