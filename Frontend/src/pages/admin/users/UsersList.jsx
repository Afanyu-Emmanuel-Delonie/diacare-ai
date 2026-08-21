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
import useToast from '../../../hooks/useToast.js';
import { activateUser, deleteUser, deactivateUser, getUserDisplayName, getUserStatus, getUsers } from '../../../services/userService.js';
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
  const [dialog, setDialog] = useState({ open: false, type: '', user: null });

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

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        getUserDisplayName(user).toLowerCase().includes(normalizedSearch) ||
        user.username?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch) ||
        user.phoneNumber?.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || getUserStatus(user) === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, search, statusFilter, users]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const paginatedUsers = filteredUsers.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const openDialog = (type, user) => setDialog({ open: true, type, user });
  const closeDialog = () => setDialog({ open: false, type: '', user: null });

  const handleConfirmedAction = async () => {
    if (!dialog.user) {
      return;
    }

    try {
      if (dialog.type === 'delete') {
        await deleteUser(dialog.user.id);
        showToast({ type: 'success', message: 'User archived successfully where allowed.' });
      } else if (dialog.type === 'deactivate') {
        await deactivateUser(dialog.user.id);
        showToast({ type: 'success', message: 'User deactivated successfully.' });
      } else {
        await activateUser(dialog.user.id);
        showToast({ type: 'success', message: 'User activated successfully.' });
      }

      closeDialog();
      await loadUsers();
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'User action failed.');
      showToast({ type: 'error', message });
      closeDialog();
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => (
        <div>
          <p className="font-semibold text-[#334155]">{getUserDisplayName(user)}</p>
          <p className="text-xs text-[#334155]/70">{user.username}</p>
        </div>
      ),
      sortValue: (user) => getUserDisplayName(user)
    },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone', render: (user) => user.phoneNumber || user.phone || 'Not available' },
    {
      key: 'role',
      header: 'Role',
      render: (user) => <Badge variant="info">{user.role}</Badge>
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => {
        const status = getUserStatus(user);
        return <StatusBadge status={status} />;
      }
    },
    { key: 'createdAt', header: 'Created', render: (user) => formatDate(user.createdAt), sortValue: (user) => user.createdAt || '' },
    { key: 'lastLogin', header: 'Last Login', render: (user) => formatDate(user.lastLogin || user.lastLoginAt), sortValue: (user) => user.lastLogin || user.lastLoginAt || '' },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (user) => (
        <RowActions actions={[
          { label: 'View details', onClick: () => navigate(`/dashboard/admin/users/${user.id}`) },
          { label: 'Edit', onClick: () => navigate(`/dashboard/admin/users/${user.id}/edit`) },
          { label: 'Deactivate', variant: 'warning', disabled: !user.active || user.deleted, onClick: () => openDialog('deactivate', user) },
          { label: 'Activate', variant: 'success', disabled: user.active || user.deleted || user.locked, onClick: () => openDialog('activate', user) },
          { label: 'Archive', variant: 'danger', disabled: user.deleted, onClick: () => openDialog('delete', user) },
        ]} />
      )
    }
  ];

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

      <FilterPanel actions={<ExportButtons data={filteredUsers} fileName="users" />}>
          <SearchInput id="search" label="Search" value={search} onChange={setSearch} placeholder="Name, email, or phone" />
          <FilterSelect label="Role" value={roleFilter} onChange={setRoleFilter} options={['ALL', ...Object.values(ROLES)]} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={['ALL', 'ACTIVE', 'INACTIVE', 'LOCKED', 'ARCHIVED']} />
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

      <ConfirmDialog
        open={dialog.open}
        title={dialog.type === 'delete' ? 'Archive user' : dialog.type === 'activate' ? 'Activate user' : 'Deactivate user'}
        message={
          dialog.type === 'delete'
            ? `Archive ${getUserDisplayName(dialog.user)} where allowed? This preserves safer account history than permanent deletion.`
            : dialog.type === 'activate'
              ? `Activate ${getUserDisplayName(dialog.user)}? This user will be able to access the system again.`
              : `Deactivate ${getUserDisplayName(dialog.user)}? This user will no longer be active.`
        }
        confirmLabel={dialog.type === 'delete' ? 'Archive' : dialog.type === 'activate' ? 'Activate' : 'Deactivate'}
        confirmVariant={dialog.type === 'activate' ? 'success' : 'critical'}
        onConfirm={handleConfirmedAction}
        onCancel={closeDialog}
      />
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
