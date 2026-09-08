import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import UserRoleBadge from '../../../components/admin/UserRoleBadge.jsx';
import useUserStatusActions from '../../../hooks/useUserStatusActions.js';
import useToast from '../../../hooks/useToast.js';
import { getUser, getUserDisplayName, getUserStatus } from '../../../services/userService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

function UserDetails() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUser = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUser(id);
      setUser(response.data);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to load user.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const { openDialog, dialogProps } = useUserStatusActions(loadUser);

  if (loading) {
    return <LoadingSpinner label="Loading user details..." />;
  }

  if (error || !user) {
    return <EmptyState title="User could not be loaded" message={error || 'User was not found.'} />;
  }

  const status = getUserStatus(user);
  const name = getUserDisplayName(user);

  return (
    <div className="space-y-6">
      <Link to="/dashboard/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
        <MdArrowBack size={16} /> Back to users
      </Link>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-xl font-bold text-[#2563EB]">
              {user.username?.[0]?.toUpperCase() || '?'}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <UserRoleBadge role={user.role} />
              </div>
              <h1 className="mt-2 text-2xl font-bold text-[#1e293b]">{name}</h1>
              <p className="mt-0.5 text-sm text-[#64748b]">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to={`/dashboard/admin/users/${user.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="warning" disabled={!user.active || user.deleted} onClick={() => openDialog('deactivate', user)}>
              Deactivate
            </Button>
            <Button variant="success" disabled={user.active || user.deleted} onClick={() => openDialog('activate', user)}>
              Activate
            </Button>
            <Button variant="critical" disabled={user.deleted} onClick={() => openDialog('delete', user)}>
              Archive
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-[#334155]">Account Information</h2>
        <dl className="mt-5 grid gap-5 md:grid-cols-2">
          <Detail label="Username" value={user.username} />
          <Detail label="Email" value={user.email} />
          <Detail label="Role" value={<UserRoleBadge role={user.role} />} />
          <Detail label="Status" value={<StatusBadge status={status} />} />
          <Detail label="Created" value={formatDate(user.createdAt)} />
          <Detail label="Last Updated" value={formatDate(user.updatedAt)} />
        </dl>
      </Card>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[#94A3B8]">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-[#334155]">{value}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString();
}

export default UserDetails;
