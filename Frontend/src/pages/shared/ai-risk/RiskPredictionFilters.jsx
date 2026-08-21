import DateRangeFilter from '../../../components/common/DateRangeFilter.jsx';
import FilterPanel from '../../../components/common/FilterPanel.jsx';
import FilterSelect from '../../../components/common/FilterSelect.jsx';
import SearchInput from '../../../components/common/SearchInput.jsx';
import { riskLevels, riskTypes } from '../../../services/riskPredictionService.js';

function RiskPredictionFilters({ filters, setFilters, patientOptions = [] }) {
  const update = (field, value) => setFilters((f) => ({ ...f, [field]: value }));

  return (
    <FilterPanel>
      <SearchInput
        id="riskSearch"
        label="Search"
        value={filters.search || ''}
        onChange={(v) => update('search', v)}
        placeholder="Patient, risk type, explanation, or action"
      />
      <FilterSelect
        label="Patient"
        value={filters.patient || 'ALL'}
        options={patientOptions.length ? patientOptions : ['ALL']}
        onChange={(v) => update('patient', v)}
      />
      <FilterSelect
        label="Risk level"
        value={filters.riskLevel || 'ALL'}
        options={['ALL', ...riskLevels]}
        onChange={(v) => update('riskLevel', v)}
      />
      <FilterSelect
        label="Risk type"
        value={filters.riskType || 'ALL'}
        options={['ALL', ...riskTypes]}
        onChange={(v) => update('riskType', v)}
      />
      <DateRangeFilter
        startDate={filters.dateFrom || ''}
        endDate={filters.dateTo || ''}
        onStartDateChange={(v) => update('dateFrom', v)}
        onEndDateChange={(v) => update('dateTo', v)}
      />
    </FilterPanel>
  );
}

export default RiskPredictionFilters;
