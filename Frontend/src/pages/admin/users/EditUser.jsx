import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner.jsx';
import useToast from '../../../hooks/useToast.js';
import { activateUser, buildUserPayload, deactivateUser, getUser, getUserInitialFormData, getUserStatus, updateUser } from '../../../services/userService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import UserForm from './UserForm.jsx';

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(getUserInitialFormData());
  const [originalStatus, setOriginalStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUser(id)
      .then((response) => {
        setFormData(getUserInitialFormData(response.data));
        setOriginalStatus(getUserStatus(response.data));
      })
      .catch((requestError) => {
        const message = getApiErrorMessage(requestError, 'Failed to load user.');
        setError(message);
        showToast({ type: 'error', message });
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await updateUser(id, buildUserPayload(formData));

      if (formData.status !== originalStatus) {
        if (formData.status === 'ACTIVE') {
          await activateUser(id);
        }

        if (formData.status === 'INACTIVE') {
          await deactivateUser(id);
        }
      }

      showToast({ type: 'success', message: 'User updated successfully.' });
      navigate(`/dashboard/admin/users/${id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to update user.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading user..." />;
  }

  if (error && !formData.email) {
    return <EmptyState title="User could not be loaded" message={error} />;
  }

  return (
    <UserForm
      title="Edit User"
      description="Update account details, assign a new role, or set a new password."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Save changes"
      error={error}
    />
  );
}

export default EditUser;
