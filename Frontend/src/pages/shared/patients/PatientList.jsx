import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import ExportButtons from '../../../components/common/ExportButtons.jsx';
import FilterPanel from '../../../components/common/FilterPanel.jsx';
import FilterSelect from '../../../components/common/FilterSelect.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import Pagination from '../../../components/common/Pagination.jsx';
import SearchInput from '../../../components/common/SearchInput.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Table, { RowActions } from '../../../components/common/Table.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { deactivatePatient, deletePatient, getPatientDisplayName, getPatientStatus, getPatients } from '../../../services/patientService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

const diabetesTypes = ['ALL', 'TYPE_1', 'TYPE_2', 'GESTATIONAL', 'PREDIABETES', 'OTHER'];
const statuses = ['ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function PatientList() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [diabetesType, setDiabetesType] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dialog, setDialog] = useState({ open: false, type: '', patient: null });

  const canCreate = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE].includes(userRole);
  const canDelete = userRole === ROLES.ADMIN;
  const canDeactivate = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE].includes(userRole);
  const canEdit = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT].includes(userRole);
  const isCaregiver = userRole === ROLES.CAREGIVER;

  const loadPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPatients();
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load patients.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search, diabetesType, doctorFilter, status, pageSize]);

  const doctorOptions = useMemo(() => {
    const names = patients.map((patient) => patient.doctorName).filter(Boolean);
    return ['ALL', ...Array.from(new Set(names)).sort()];
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesSearch =
        !normalizedSearch ||
        patient.patientCode?.toLowerCase().includes(normalizedSearch) ||
        getPatientDisplayName(patient).toLowerCase().includes(normalizedSearch) ||
        patient.email?.toLowerCase().includes(normalizedSearch) ||
        patient.phone?.toLowerCase().includes(normalizedSearch) ||
        patient.emergencyContactPhone?.toLowerCase().includes(normalizedSearch);
      const matchesType = diabetesType === 'ALL' || patient.diabetesType === diabetesType;
      const matchesDoctor = doctorFilter === 'ALL' || patient.doctorName === doctorFilter;
      const matchesStatus = status === 'ALL' || getPatientStatus(patient) === status;
      return matchesSearch && matchesType && matchesDoctor && matchesStatus;
    });
  }, [diabetesType, doctorFilter, patients, search, status]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const visiblePatients = filteredPatients.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const confirmAction = async () => {
    if (!dialog.patient) {
      return;
    }
    try {
      if (dialog.type === 'delete') {
        await deletePatient(dialog.patient.id);
        showToast({ type: 'success', message: 'Patient archived successfully where allowed.' });
      } else {
        await deactivatePatient(dialog.patient.id);
        showToast({ type: 'success', message: 'Patient deactivated successfully.' });
      }
      setDialog({ open: false, type: '', patient: null });
      await loadPatients();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Patient action failed.');
      showToast({ type: 'error', message });
      setDialog({ open: false, type: '', patient: null });
    }
  };

  // Table is intentionally condensed to the essentials for fast scanning;
  // everything else (contact info, emergency contact, timestamps) lives on the details page.
  const columns = useMemo(() => [
    {
      key: 'fullName',
      header: 'Patient',
      render: (patient) => (
        <Link to={`/dashboard/patients/${patient.id}`} className="group flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-xs font-bold text-[#2563EB]">
            {getInitials(getPatientDisplayName(patient))}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-[#334155] group-hover:text-[#2563EB]">{getPatientDisplayName(patient)}</span>
            <span className="block truncate text-xs text-[#94a3b8]">{patient.patientCode || patient.email || 'Not available'}</span>
          </span>
        </Link>
      ),
      sortValue: (patient) => getPatientDisplayName(patient)
    },
    {
      key: 'diabetesType',
      header: 'Diabetes Type',
      render: (patient) => <Badge variant="info">{patient.diabetesType || 'Not specified'}</Badge>
    },
    { key: 'doctorName', header: 'Doctor Assigned', render: (patient) => patient.doctorName || 'Not assigned' },
    {
      key: 'status',
      header: 'Status',
      render: (patient) => {
        const value = getPatientStatus(patient);
        return <StatusBadge status={value} />;
      }
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (patient) => (
        <RowActions actions={[
          { label: 'View details', onClick: () => navigate(`/dashboard/patients/${patient.id}`) },
          { label: 'Edit', hidden: !canEdit, onClick: () => navigate(`/dashboard/patients/${patient.id}/edit`) },
          { label: 'Deactivate', variant: 'warning', hidden: !canDeactivate, disabled: !patient.active || patient.deleted, onClick: () => setDialog({ open: true, type: 'deactivate', patient }) },
          { label: 'Archive', variant: 'danger', hidden: !canDelete, disabled: patient.deleted, onClick: () => setDialog({ open: true, type: 'delete', patient }) },
        ]} />
      )
    }
  ], [canDeactivate, canDelete, canEdit, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">{isCaregiver ? 'My Patients' : 'Patients'}</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            {isCaregiver
              ? 'View the patients assigned to your care and open their monitoring, medications, appointments, and alerts.'
              : 'Manage patient profiles according to your assigned access.'}
          </p>
        </div>
        {canCreate && (
          <Link to="/dashboard/patients/new">
            <Button>Create patient</Button>
          </Link>
        )}
      </div>

      <FilterPanel actions={!isCaregiver ? <ExportButtons data={filteredPatients} fileName="patients" /> : null}>
          <SearchInput id="patientSearch" label="Search" value={search} onChange={setSearch} placeholder="Name, email, or phone" />
          <FilterSelect label="Diabetes type" value={diabetesType} options={diabetesTypes} onChange={setDiabetesType} />
          {!isCaregiver && <FilterSelect label="Assigned doctor" value={doctorFilter} options={doctorOptions} onChange={setDoctorFilter} />}
          <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
      </FilterPanel>

      {loading && <LoadingSpinner label="Loading patients..." />}
      {!loading && error && <EmptyState title="Patients could not be loaded" message={error} />}
      {!loading && !error && (
        <>
          <Table columns={columns} data={visiblePatients} emptyMessage={isCaregiver ? 'No patients are currently assigned to your caregiver account.' : 'No patients match the selected filters.'} />
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredPatients.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={dialog.open}
        title={dialog.type === 'delete' ? 'Archive patient' : 'Deactivate patient'}
        message={dialog.type === 'delete' ? `Archive ${getPatientDisplayName(dialog.patient)} where allowed? This preserves healthcare history.` : `Deactivate ${getPatientDisplayName(dialog.patient)}?`}
        confirmLabel={dialog.type === 'delete' ? 'Archive' : 'Deactivate'}
        onConfirm={confirmAction}
        onCancel={() => setDialog({ open: false, type: '', patient: null })}
      />
    </div>
  );
}

export default PatientList;
