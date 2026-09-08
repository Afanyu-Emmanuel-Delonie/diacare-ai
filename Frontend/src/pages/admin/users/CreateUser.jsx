import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useToast from '../../../hooks/useToast.js';
import { buildUserPayload, createUser, deactivateUser, getUserInitialFormData } from '../../../services/userService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import { ROLES } from '../../../utils/roles.js';
import UserForm from './UserForm.jsx';

function CreateUser() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    ...getUserInitialFormData({ role: ROLES.PATIENT, active: true }),
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ROLES.PATIENT,
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await createUser(buildUserPayload(formData, true));

      if (formData.status === 'INACTIVE' && response.data?.id) {
        await deactivateUser(response.data.id);
      }

      showToast({ type: 'success', message: 'User created successfully.' });
      navigate(`/dashboard/admin/users/${response.data.id}`);
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Failed to create user.');
      setError(message);
      showToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserForm
      title="Add User"
      description="Create a new system user and assign the correct role."
      formData={formData}
      onChange={updateField}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel="Create user"
      passwordRequired
      showStatus
      error={error}
    />
  );
}

export default CreateUser;
