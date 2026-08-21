import Card from '../../../components/common/Card.jsx';
import { displayValue, formatDateTime, formatLabel } from '../../../utils/reportFormatting.js';

function ActivitySection({ title, items = [], emptyMessage = 'No data available for this section.' }) {
  return (
    <Card>
      <h2 className="text-lg font-bold text-[#334155]">{title}</h2>
      {items.length > 0 ? (
        <div className="mt-4 divide-y divide-[#334155]/15">
          {items.map((item, index) => (
            <div key={item.id || index} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-semibold text-[#334155]">{item.title || item.event || item.action || 'Activity'}</p>
                <p className="text-xs font-medium text-[#334155]/65">{formatDateTime(item.dateTime || item.timestamp || item.createdAt)}</p>
              </div>
              {item.details && (
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {Object.entries(item.details).map(([key, value]) => (
                    <p key={key} className="text-sm text-[#334155]/85">
                      <span className="font-semibold">{formatLabel(key)}:</span> {displayValue(value)}
                    </p>
                  ))}
                </div>
              )}
              {item.description && <p className="mt-1 text-sm text-[#334155]/80">{item.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#334155]/75">{emptyMessage}</p>
      )}
    </Card>
  );
}

export default ActivitySection;
