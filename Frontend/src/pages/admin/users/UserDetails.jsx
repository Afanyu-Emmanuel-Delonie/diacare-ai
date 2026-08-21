import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { activateUser, deleteUser, deactivateUser, getUser, getUserDisplayName, getUserInitialFormData, getUserStatus } from '../../../services/userService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: '' });

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

  const handleConfirmedAction = async () => {
    try {
      if (dialog.type === 'delete') {
        await deleteUser(id);
        showToast({ type: 'success', message: 'User archived successfully where allowed.' });
        navigate('/dashboard/admin/users');
      } else if (dialog.type === 'deactivate') {
        await deactivateUser(id);
        showToast({ type: 'success', message: 'User deactivated successfully.' });
        setDialog({ open: false, type: '' });
        await loadUser();
      } else {
        await activateUser(id);
        showToast({ type: 'success', message: 'User activated successfully.' });
        setDialog({ open: false, type: '' });
        await loadUser();
      }
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'User action failed.');
      showToast({ type: 'error', message });
      setDialog({ open: false, type: '' });
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading user details..." />;
  }

  if (error || !user) {
    return <EmptyState title="User could not be loaded" message={error || 'User was not found.'} />;
  }

  const status = getUserStatus(user);
  const userFormData = getUserInitialFormData(user);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#334155]">{getUserDisplayName(user)}</h1>
          <p className="mt-1 text-[#334155]/80">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/dashboard/admin/users/${user.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="warning" disabled={!user.active || user.deleted} onClick={() => setDialog({ open: true, type: 'deactivate' })}>
            Deactivate
          </Button>
          <Button variant="success" disabled={user.active || user.deleted || user.locked} onClick={() => setDialog({ open: true, type: 'activate' })}>
            Activate
          </Button>
          <Button variant="critical" disabled={user.deleted} onClick={() => setDialog({ open: true, type: 'delete' })}>
            Archive
          </Button>
        </div>
      </div>

      <Card>
        <dl className="grid gap-5 md:grid-cols-2">
          <Detail label="First Name" value={user.firstName || userFormData.firstName || 'Not available'} />
          <Detail label="Last Name" value={user.lastName || userFormData.lastName || 'Not available'} />
          <Detail label="Username" value={user.username} />
          <Detail label="Email" value={user.email} />
          <Detail label="Phone Number" value={user.phoneNumber || user.phone || 'Not available'} />
          <Detail label="Role" value={<Badge variant="info">{user.role}</Badge>} />
          <Detail label="Status" value={<Badge variant={status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'warning' : 'critical'}>{status}</Badge>} />
          <Detail label="Created Date" value={formatDate(user.createdAt)} />
          <Detail label="Last Login" value={formatDate(user.lastLogin || user.lastLoginAt)} />
          <Detail label="Updated Date" value={formatDate(user.updatedAt)} />
        </dl>
      </Card>

      <ConfirmDialog
        open={dialog.open}
        title={dialog.type === 'delete' ? 'Archive user' : dialog.type === 'activate' ? 'Activate user' : 'Deactivate user'}
        message={
          dialog.type === 'delete'
            ? `Archive ${getUserDisplayName(user)} where allowed?`
            : dialog.type === 'activate'
              ? `Activate ${getUserDisplayName(user)}?`
              : `Deactivate ${getUserDisplayName(user)}?`
        }
        confirmLabel={dialog.type === 'delete' ? 'Archive' : dialog.type === 'activate' ? 'Activate' : 'Deactivate'}
        confirmVariant={dialog.type === 'activate' ? 'success' : 'critical'}
        onConfirm={handleConfirmedAction}
        onCancel={() => setDialog({ open: false, type: '' })}
      />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-[#334155]/70">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-[#334155]">{value}</dd>
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
