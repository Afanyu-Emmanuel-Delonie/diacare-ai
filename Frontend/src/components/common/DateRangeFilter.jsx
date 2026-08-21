function DateRangeFilter({ startDate, endDate, onStartDateChange, onEndDateChange, startLabel = 'Date from', endLabel = 'Date to' }) {
  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor="dateFrom" className="block text-xs font-semibold uppercase tracking-wide text-[#64748b]">
          {startLabel}
        </label>
        <input
          id="dateFrom"
          type="date"
          value={startDate || ''}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="dateTo" className="block text-xs font-semibold uppercase tracking-wide text-[#64748b]">
          {endLabel}
        </label>
        <input
          id="dateTo"
          type="date"
          value={endDate || ''}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
        />
      </div>
    </>
  );
}

export default DateRangeFilter;
