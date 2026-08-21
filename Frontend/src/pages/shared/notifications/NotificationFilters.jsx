import DateRangeFilter from '../../../components/common/DateRangeFilter.jsx';
import FilterPanel from '../../../components/common/FilterPanel.jsx';
import FilterSelect from '../../../components/common/FilterSelect.jsx';
import SearchInput from '../../../components/common/SearchInput.jsx';
import { notificationCategories, priorityLevels, readStatuses } from '../../../services/notificationService.js';

function NotificationFilters({ filters, setFilters, categoryLocked = false }) {
  const update = (field, value) => setFilters((f) => ({ ...f, [field]: value }));

  return (
    <FilterPanel>
      <SearchInput
        id="notificationSearch"
        label="Search"
        value={filters.search || ''}
        onChange={(v) => update('search', v)}
        placeholder="Title, description, patient, or sender"
      />
      {!categoryLocked && (
        <FilterSelect label="Category" value={filters.category || 'ALL'} options={notificationCategories} onChange={(v) => update('category', v)} />
      )}
      <FilterSelect label="Priority" value={filters.priority || 'ALL'} options={priorityLevels} onChange={(v) => update('priority', v)} />
      <FilterSelect label="Read status" value={filters.readStatus || 'ALL'} options={readStatuses} onChange={(v) => update('readStatus', v)} />
      <DateRangeFilter
        startDate={filters.dateFrom || ''}
        endDate={filters.dateTo || ''}
        onStartDateChange={(v) => update('dateFrom', v)}
        onEndDateChange={(v) => update('dateTo', v)}
      />
    </FilterPanel>
  );
}

export default NotificationFilters;
