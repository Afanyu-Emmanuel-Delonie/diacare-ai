import Card from '../../../components/common/Card.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import { displayValue, formatDateTime, formatLabel } from '../../../utils/reportFormatting.js';

function ClinicalReportView({ report }) {
  const profile = report?.patientProfile || {};
  const sections = Object.values(report?.sections || {});

  if (!report) {
    return <EmptyState title="No data available for this section." message="Select a patient or load your report." />;
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col justify-between gap-3 md:flex-row">
          <div>
            <h2 className="text-xl font-bold text-[#334155]">{report.reportAudience || 'Health Report'}</h2>
          </div>
          <p className="text-sm font-semibold text-[#334155]/80">Generated: {formatDateTime(report.generatedAt)}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(profile).length > 0 ? (
            Object.entries(profile).map(([key, value]) => (
              <div key={key} className="rounded-md border border-[#334155]/15 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#334155]/70">{formatLabel(key)}</p>
                <p className="mt-1 text-sm font-semibold text-[#334155]">{displayValue(value)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#334155]/80">No data available for this section.</p>
          )}
        </div>
      </Card>

      {sections.length > 0 ? (
        sections.map((section, sectionIndex) => (
          <Card key={section.sectionName || sectionIndex}>
            <h3 className="text-lg font-bold text-[#334155]">{section.sectionName || 'Report Section'}</h3>
            {section.message && <p className="mt-2 text-sm text-[#334155]/80">{section.message}</p>}
            <div className="mt-4 space-y-3">
              {section.items?.length > 0 ? (
                section.items.map((item, itemIndex) => (
                  <div key={`${section.sectionName}-${itemIndex}`} className="rounded-md border border-[#334155]/15 p-3">
                    <p className="text-sm font-semibold text-[#2563EB]">{formatDateTime(item.dateTime)}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {Object.entries(item.details || {}).map(([key, value]) => (
                        <p key={key} className="text-sm text-[#334155]">
                          <span className="font-semibold">{formatLabel(key)}:</span> {displayValue(value)}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#334155]/80">No data available for this section.</p>
              )}
            </div>
          </Card>
        ))
      ) : (
        <EmptyState title="No data available for this section." message="This report does not contain clinical sections yet." />
      )}
    </div>
  );
}

export default ClinicalReportView;
