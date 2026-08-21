import Card from './Card.jsx';

function DashboardCard({ title, subtitle, badge, children, className = '' }) {
  return (
    <Card className={className}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-[#334155]/75">{subtitle}</p>}
        </div>
        {badge}
      </div>
      {children}
    </Card>
  );
}

export default DashboardCard;
