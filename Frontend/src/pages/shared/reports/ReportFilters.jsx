import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import DateRangeFilter from '../../../components/common/DateRangeFilter.jsx';
import SearchInput from '../../../components/common/SearchInput.jsx';

function ReportFilters({ filters, onChange, onSubmit, loading }) {
  const updateField = (name, value) => onChange({ ...filters, [name]: value });

  return (
    <Card>
      <form
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(filters);
        }}
      >
        <SearchInput
          id="reportFilterSearch"
          label="Search"
          value={filters.search || ''}
          onChange={(value) => updateField('search', value)}
          placeholder="Keyword, patient, or event"
        />
        <DateRangeFilter
          startDate={filters.startDate || ''}
          endDate={filters.endDate || ''}
          onStartDateChange={(value) => updateField('startDate', value)}
          onEndDateChange={(value) => updateField('endDate', value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Generate report'}
        </Button>
      </form>
    </Card>
  );
}

export default ReportFilters;
