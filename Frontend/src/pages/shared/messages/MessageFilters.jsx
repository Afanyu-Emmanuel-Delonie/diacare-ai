import FilterPanel from '../../../components/common/FilterPanel.jsx';
import FilterSelect from '../../../components/common/FilterSelect.jsx';
import SearchInput from '../../../components/common/SearchInput.jsx';
import { messageStatuses } from '../../../services/messageService.js';

function MessageFilters({ filters, setFilters }) {
  const update = (field, value) => setFilters((f) => ({ ...f, [field]: value }));

  return (
    <FilterPanel>
      <SearchInput
        id="messageSearch"
        label="Search"
        value={filters.search || ''}
        onChange={(v) => update('search', v)}
        placeholder="Subject, patient, sender, role, or message"
      />
      <FilterSelect
        label="Read status"
        value={filters.status || 'ALL'}
        options={messageStatuses}
        onChange={(v) => update('status', v)}
      />
    </FilterPanel>
  );
}

export default MessageFilters;
