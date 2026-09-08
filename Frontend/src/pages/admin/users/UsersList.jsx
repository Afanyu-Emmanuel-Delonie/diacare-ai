import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdCheckCircle, MdInventory2, MdPeople, MdPersonOff } from 'react-icons/md';
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
import DashboardStatCell from '../../../components/dashboard/DashboardStatCell.jsx';
import UserRoleBadge from '../../../components/admin/UserRoleBadge.jsx';
import useToast from '../../../hooks/useToast.js';
import useUserStatusActions from '../../../hooks/useUserStatusActions.js';
import { getUserDisplayName, getUserStatus, getUsers } from '../../../services/userService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';

function UsersList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load users.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search, roleFilter, statusFilter, pageSize]);

  const { openDialog, dialogProps } = useUserStatusActions(loadUsers);

  const counts = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => getUserStatus(u) === 'ACTIVE').length,
    inactive: users.filter((u) => getUserStatus(u) === 'INACTIVE').length,
    archived: users.filter((u) => getUserStatus(u) === 'ARCHIVED').length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        getUserDisplayName(user).toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || getUserStatus(user) === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const paginatedUsers = filteredUsers.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  // Condensed to the essentials for fast scanning; everything else lives on the details page.
  const columns = useMemo(() => [
    {
      key: 'username',
      header: 'User',
      render: (user) => (
        <Link to={`/dashboard/admin/users/${user.id}`} className="group flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-xs font-bold text-[#2563EB]">
            {user.username?.[0]?.toUpperCase() || '?'}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-[#334155] group-hover:text-[#2563EB]">{user.username}</span>
            <span className="block truncate text-xs text-[#94a3b8]">{user.email}</span>
          </span>
        </Link>
      ),
      sortValue: (user) => user.username || ''
    },
    { key: 'role', header: 'Role', render: (user) => <UserRoleBadge role={user.role} /> },
    { key: 'status', header: 'Status', render: (user) => <StatusBadge status={getUserStatus(user)} /> },
    { key: 'createdAt', header: 'Created', render: (user) => formatDate(user.createdAt), sortValue: (user) => user.createdAt || '' },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (user) => (
        <RowActions actions={[
          { label: 'View details', onClick: () => navigate(`/dashboard/admin/users/${user.id}`) },
          { label: 'Edit', onClick: () => navigate(`/dashboard/admin/users/${user.id}/edit`) },
          { label: 'Deactivate', variant: 'warning', disabled: !user.active || user.deleted, onClick: () => openDialog('deactivate', user) },
          { label: 'Activate', variant: 'success', disabled: user.active || user.deleted, onClick: () => openDialog('activate', user) },
          { label: 'Archive', variant: 'danger', disabled: user.deleted, onClick: () => openDialog('delete', user) },
        ]} />
      )
    }
  ], [navigate, openDialog]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">User Management</h1>
          <p className="mt-1 text-[#334155]/80">View, search, create, edit, deactivate, and archive system users.</p>
        </div>
        <Link to="/dashboard/admin/users/new">
          <Button>Add user</Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCell icon={MdPeople} label="Total Users" value={counts.total} helper="All registered accounts" color="#2563EB" />
        <DashboardStatCell icon={MdCheckCircle} label="Active" value={counts.active} helper="Currently able to sign in" color="#16A34A" />
        <DashboardStatCell icon={MdPersonOff} label="Inactive" value={counts.inactive} helper="Deactivated by an admin" color="#D97706" />
        <DashboardStatCell icon={MdInventory2} label="Archived" value={counts.archived} helper="Soft-deleted accounts" color="#64748B" />
      </div>

      <FilterPanel actions={<ExportButtons data={filteredUsers} fileName="users" />}>
          <SearchInput id="search" label="Search" value={search} onChange={setSearch} placeholder="Username or email" />
          <FilterSelect label="Role" value={roleFilter} onChange={setRoleFilter} options={['ALL', ...Object.values(ROLES)]} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={['ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED']} />
      </FilterPanel>

      {loading && <LoadingSpinner label="Loading users..." />}
      {!loading && error && <EmptyState title="Users could not be loaded" message={error} />}
      {!loading && !error && (
        <>
          <Table columns={columns} data={paginatedUsers} emptyMessage="No users match the selected filters." />

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        </>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString();
}

export default UsersList;
