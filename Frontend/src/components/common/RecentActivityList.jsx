import Badge from './Badge.jsx';

function RecentActivityList({ items = [], emptyTitle = 'No recent activity', emptyMessage = 'No data available for this section.' }) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-[#334155]/15 bg-[#FFFFFF] px-4 py-6 text-center">
        <h3 className="text-sm font-semibold text-[#334155]">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-[#334155]/75">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#334155]/15">
      {items.map((item, index) => (
        <article key={item.id || `${item.title}-${index}`} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#334155]">{item.title}</h3>
              {item.description && <p className="mt-1 text-sm text-[#334155]/75">{item.description}</p>}
              {item.time && <p className="mt-1 text-xs font-medium text-[#334155]/65">{item.time}</p>}
            </div>
            {item.status && <Badge variant={item.variant || 'info'}>{item.status}</Badge>}
          </div>
        </article>
      ))}
    </div>
  );
}

export default RecentActivityList;
