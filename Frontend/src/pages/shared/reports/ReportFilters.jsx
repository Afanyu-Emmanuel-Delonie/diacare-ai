import DateRangeFilter from '../../../components/common/DateRangeFilter.jsx';
import FilterPanel from '../../../components/common/FilterPanel.jsx';
import FilterSelect from '../../../components/common/FilterSelect.jsx';

const REPORT_TYPES = [
  { value: '', label: 'All report types' },
  { value: 'CLINICAL', label: 'Clinical' },
  { value: 'ADMIN_OPERATIONAL', label: 'Admin operational' },
  { value: 'SECURITY_AUDIT', label: 'Security audit' },
  { value: 'PATIENT_HEALTH_SUMMARY', label: 'Patient health summary' },
];

const ROLES = [
  { value: '', label: 'All roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'CAREGIVER', label: 'Caregiver' },
  { value: 'PATIENT', label: 'Patient' },
];

function ReportFilters({ filters, setFilters, onApply, onReset, showRole = false, showPatient = false, showDoctor = false }) {
  const update = (field, value) => setFilters((f) => ({ ...f, [field]: value }));

  return (
    <FilterPanel
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="h-8 rounded-lg border border-[#e2e8f0] px-3 text-xs font-semibold text-[#64748b] hover:border-[#cbd5e1] hover:text-[#334155] transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-8 rounded-lg bg-[#2563EB] px-3 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
          >
            Apply
          </button>
        </div>
      }
    >
      <DateRangeFilter
        startDate={filters.startDate || ''}
        endDate={filters.endDate || ''}
        onStartDateChange={(v) => update('startDate', v)}
        onEndDateChange={(v) => update('endDate', v)}
        startLabel="Start date"
        endLabel="End date"
      />
      <FilterSelect
        label="Report type"
        value={filters.reportType || ''}
        options={REPORT_TYPES}
        onChange={(v) => update('reportType', v)}
      />
      {showPatient && (
        <div className="space-y-1.5">
          <label htmlFor="patientId" className="block text-xs font-semibold uppercase tracking-wide text-[#64748b]">Patient ID</label>
          <input
            id="patientId"
            type="number"
            min="1"
            value={filters.patientId || ''}
            onChange={(e) => update('patientId', e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </div>
      )}
      {showDoctor && (
        <div className="space-y-1.5">
          <label htmlFor="doctorId" className="block text-xs font-semibold uppercase tracking-wide text-[#64748b]">Doctor ID</label>
          <input
            id="doctorId"
            type="number"
            min="1"
            value={filters.doctorId || ''}
            onChange={(e) => update('doctorId', e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </div>
      )}
      {showRole && (
        <FilterSelect label="Role" value={filters.role || ''} options={ROLES} onChange={(v) => update('role', v)} />
      )}
    </FilterPanel>
  );
}

export default ReportFilters;
