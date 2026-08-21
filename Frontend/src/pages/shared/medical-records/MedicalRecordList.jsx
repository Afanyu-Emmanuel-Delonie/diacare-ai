import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdArrowRightAlt,
  MdAssignment,
  MdCalendarToday,
  MdClose,
  MdExpandMore,
  MdFilterAlt,
  MdLocalHospital,
  MdPerson,
  MdSearch,
} from 'react-icons/md';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import Pagination from '../../../components/common/Pagination.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Table, { RowActions } from '../../../components/common/Table.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { filterMedicalRecords, getMedicalRecords, getMedicalRecordsByPatient, getRecordStatus } from '../../../services/medicalRecordService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

const DEFAULT_FILTERS = {
  search: '',
  patient: 'ALL',
  doctor: 'ALL',
  diagnosis: 'ALL',
  dateFrom: '',
  dateTo: ''
};

function MedicalRecordList() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, patient: patientId || 'ALL' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const canCreate = userRole === ROLES.DOCTOR;
  const canEdit = userRole === ROLES.DOCTOR;

  useEffect(() => {
    setLoading(true);
    setError('');
    const request = patientId ? getMedicalRecordsByPatient(patientId) : getMedicalRecords();

    request
      .then((response) => setRecords(response.data || []))
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load medical records.');
        setError(message);
        showToast({ type: 'error', message });
      })
      .finally(() => setLoading(false));
  }, [patientId, showToast]);

  useEffect(() => {
    setPage(0);
  }, [filters, pageSize]);

  const options = useMemo(() => buildFilterOptions(records), [records]);
  const filteredRecords = useMemo(() => filterMedicalRecords(records, filters), [filters, records]);
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const visibleRecords = filteredRecords.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search) chips.push({ key: 'search', label: `"${filters.search}"`, onClear: () => updateFilter('search', '') });
    if (filters.patient !== 'ALL') chips.push({ key: 'patient', label: `Patient: ${filters.patient}`, onClear: () => updateFilter('patient', 'ALL') });
    if (filters.doctor !== 'ALL') chips.push({ key: 'doctor', label: `Doctor: ${filters.doctor}`, onClear: () => updateFilter('doctor', 'ALL') });
    if (filters.diagnosis !== 'ALL') chips.push({ key: 'diagnosis', label: `Diagnosis: ${filters.diagnosis}`, onClear: () => updateFilter('diagnosis', 'ALL') });
    if (filters.dateFrom) chips.push({ key: 'dateFrom', label: `From ${formatDate(filters.dateFrom)}`, onClear: () => updateFilter('dateFrom', '') });
    if (filters.dateTo) chips.push({ key: 'dateTo', label: `To ${formatDate(filters.dateTo)}`, onClear: () => updateFilter('dateTo', '') });
    return chips;
  }, [filters]);

  const columns = [
    { key: 'recordDate', header: 'Date', render: (record) => formatDate(record.recordDate), sortValue: (record) => record.recordDate || '' },
    { key: 'patientName', header: 'Patient', render: (record) => record.patientName || `Patient #${record.patientId}` },
    { key: 'doctorName', header: 'Doctor', render: (record) => record.doctorName || 'Not available' },
    {
      key: 'diabetesType',
      header: 'Diabetes Type',
      render: (record) => <Badge variant="info">{record.diabetesType || 'Not specified'}</Badge>
    },
    { key: 'diagnosis', header: 'Diagnosis' },
    { key: 'allergies', header: 'Allergies', render: (record) => record.allergies || 'No allergies recorded' },
    { key: 'status', header: 'Status', render: (record) => <StatusBadge status={getRecordStatus(record)} /> },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (record) => (
        <RowActions actions={[
          { label: 'View details', onClick: () => navigate(`/dashboard/medical-records/${record.id}`) },
          { label: 'Edit', hidden: !canEdit, onClick: () => navigate(`/dashboard/medical-records/${record.id}/edit`) },
        ]} />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">Medical History</h1>
          <p className="mt-1 text-[#334155]/80">View diagnosis history, allergies, treatment plans, and doctor notes according to your role.</p>
        </div>
        {canCreate && (
          <Link to={patientId ? `/dashboard/medical-records/new?patientId=${patientId}` : '/dashboard/medical-records/new'}>
            <Button>Add medical record</Button>
          </Link>
        )}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#334155]/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <MdFilterAlt size={18} className="text-[#2563EB]" />
            <h2 className="text-sm font-semibold text-[#334155]">Filters</h2>
            {activeChips.length > 0 && <Badge variant="info">{activeChips.length} active</Badge>}
          </div>
          {activeChips.length > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] transition hover:text-[#1d4ed8]"
            >
              <MdClose size={14} /> Clear all
            </button>
          )}
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-[#334155]/15 bg-[#F8FAFC] px-3.5 transition focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2563EB]/15">
            <MdSearch size={18} className="shrink-0 text-[#94A3B8]" />
            <input
              id="medicalRecordSearch"
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search by patient, diagnosis, allergies, or notes"
              className="min-h-11 w-full flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            />
            {filters.search && (
              <button type="button" onClick={() => updateFilter('search', '')} aria-label="Clear search" className="shrink-0 text-[#94A3B8] transition hover:text-[#334155]">
                <MdClose size={16} />
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect icon={MdPerson} label="Patient" value={filters.patient} options={options.patients} allLabel="All patients" onChange={(value) => updateFilter('patient', value)} />
            <FilterSelect icon={MdLocalHospital} label="Doctor" value={filters.doctor} options={options.doctors} allLabel="All doctors" onChange={(value) => updateFilter('doctor', value)} />
            <FilterSelect icon={MdAssignment} label="Diagnosis" value={filters.diagnosis} options={options.diagnoses} allLabel="All diagnoses" onChange={(value) => updateFilter('diagnosis', value)} />
            <DateRangeField
              from={filters.dateFrom}
              to={filters.dateTo}
              onFromChange={(value) => updateFilter('dateFrom', value)}
              onToChange={(value) => updateFilter('dateTo', value)}
            />
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-[#334155]/10 pt-3.5">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onClear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB]/25 bg-[#2563EB]/5 py-1 pl-3 pr-2 text-xs font-medium text-[#2563EB] transition hover:bg-[#2563EB]/10"
                >
                  {chip.label}
                  <MdClose size={13} />
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {loading && <LoadingSpinner label="Loading medical records..." />}
      {!loading && error && <EmptyState title="Medical records could not be loaded" message={error} />}
      {!loading && !error && (
        <>
          <p className="text-sm text-[#334155]/70">
            Showing {filteredRecords.length} of {records.length} record{records.length === 1 ? '' : 's'}
          </p>
          <Table columns={columns} data={visibleRecords} emptyMessage="No medical records match the selected filters." />
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredRecords.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        </>
      )}
    </div>
  );
}

function buildFilterOptions(records) {
  const patients = records.map((record) => record.patientName || (record.patientId ? `Patient #${record.patientId}` : '')).filter(Boolean);
  const doctors = records.map((record) => record.doctorName).filter(Boolean);
  const diagnoses = records.map((record) => record.diagnosis).filter(Boolean);

  return {
    patients: ['ALL', ...Array.from(new Set(patients)).sort()],
    doctors: ['ALL', ...Array.from(new Set(doctors)).sort()],
    diagnoses: ['ALL', ...Array.from(new Set(diagnoses)).sort()]
  };
}

function FilterSelect({ icon: Icon, label, value, options, onChange, allLabel = 'All' }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#334155]/60">{label}</label>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none rounded-xl border border-[#334155]/15 bg-white pl-9 pr-8 text-sm text-[#334155] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option === 'ALL' ? allLabel : option}
            </option>
          ))}
        </select>
        <MdExpandMore size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
      </div>
    </div>
  );
}

function DateRangeField({ from, to, onFromChange, onToChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-[#334155]/60">Date range</label>
      <div className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[#334155]/15 bg-white pl-2.5 pr-1.5">
        <MdCalendarToday size={15} className="shrink-0 text-[#94A3B8]" />
        <input
          type="date"
          value={from}
          onChange={(event) => onFromChange(event.target.value)}
          aria-label="Date from"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#334155] outline-none [color-scheme:light]"
        />
        <MdArrowRightAlt size={16} className="shrink-0 text-[#94A3B8]" />
        <input
          type="date"
          value={to}
          onChange={(event) => onToChange(event.target.value)}
          aria-label="Date to"
          min={from || undefined}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#334155] outline-none [color-scheme:light]"
        />
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleDateString();
}

export default MedicalRecordList;
