import { useEffect, useMemo, useState } from 'react';
import DateRangeFilter from '../../../components/common/DateRangeFilter.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import FilterPanel from '../../../components/common/FilterPanel.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import SearchInput from '../../../components/common/SearchInput.jsx';
import useToast from '../../../hooks/useToast.js';
import { filterAppointments, getAppointments } from '../../../services/appointmentService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import AppointmentCalendar from './AppointmentCalendar.jsx';

function AppointmentCalendarPage() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    getAppointments()
      .then((response) => setAppointments(response.data || []))
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load appointment calendar.');
        setError(message);
        showToast({ type: 'error', message });
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  const filteredAppointments = useMemo(() => {
    return filterAppointments(appointments, {
      search,
      patient: 'ALL',
      doctor: 'ALL',
      status: 'ALL',
      appointmentType: 'ALL',
      dateFrom,
      dateTo
    });
  }, [appointments, dateFrom, dateTo, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#334155]">Appointment Calendar</h1>
        <p className="mt-1 text-[#334155]/80">A day-by-day view of scheduled appointments.</p>
      </div>

      <FilterPanel>
        <SearchInput id="appointmentCalendarSearch" label="Search calendar" value={search} onChange={setSearch} placeholder="Patient, type, reason, or location" />
        <DateRangeFilter startDate={dateFrom} endDate={dateTo} onStartDateChange={setDateFrom} onEndDateChange={setDateTo} />
      </FilterPanel>

      {loading && <LoadingSkeleton rows={4} />}
      {!loading && error && <EmptyState title="Appointment calendar could not be loaded" message={error} />}
      {!loading && !error && filteredAppointments.length === 0 && <EmptyState title="No calendar appointments" message="No appointments match the selected calendar filters." />}
      {!loading && !error && filteredAppointments.length > 0 && <AppointmentCalendar appointments={filteredAppointments} />}
    </div>
  );
}

export default AppointmentCalendarPage;
