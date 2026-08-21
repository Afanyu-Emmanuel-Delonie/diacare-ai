import Card from './Card.jsx';

function StatCard({ title, value, description, icon: Icon, color = '#2563EB' }) {
  return (
    <Card className="flex items-start gap-4">
      {Icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}16` }}>
          <Icon size={22} style={{ color }} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#334155]/70">{title}</p>
        <p className="mt-1 text-2xl font-bold text-[#334155]">{value}</p>
        {description && <p className="mt-1 text-sm text-[#334155]/60">{description}</p>}
      </div>
    </Card>
  );
}

export default StatCard;
