import { useState } from 'react';
import useToast from './useToast.js';
import { activateUser, deactivateUser, deleteUser, getUserDisplayName } from '../services/userService.js';
import { getApiErrorMessage } from '../utils/apiErrors.js';

// Shared archive / activate / deactivate workflow for a single user, including
// the confirm-dialog state. Used by both UsersList (row actions) and
// UserDetails (page actions) so the behavior only lives in one place.
export default function useUserStatusActions(onChanged) {
  const { showToast } = useToast();
  const [dialog, setDialog] = useState({ open: false, type: '', user: null });

  const openDialog = (type, user) => setDialog({ open: true, type, user });
  const closeDialog = () => setDialog({ open: false, type: '', user: null });

  const confirm = async () => {
    if (!dialog.user) return;
    const { type, user } = dialog;

    try {
      if (type === 'delete') {
        await deleteUser(user.id);
        showToast({ type: 'success', message: 'User archived successfully.' });
      } else if (type === 'deactivate') {
        await deactivateUser(user.id);
        showToast({ type: 'success', message: 'User deactivated successfully.' });
      } else {
        await activateUser(user.id);
        showToast({ type: 'success', message: 'User activated successfully.' });
      }
      closeDialog();
      await onChanged?.();
    } catch (requestError) {
      showToast({ type: 'error', message: getApiErrorMessage(requestError, 'User action failed.') });
      closeDialog();
    }
  };

  const dialogProps = {
    open: dialog.open,
    title: dialog.type === 'delete' ? 'Archive user' : dialog.type === 'activate' ? 'Activate user' : 'Deactivate user',
    message:
      dialog.type === 'delete'
        ? `Archive ${getUserDisplayName(dialog.user)}? This preserves account history instead of permanently deleting it.`
        : dialog.type === 'activate'
          ? `Activate ${getUserDisplayName(dialog.user)}? This user will be able to sign in again.`
          : `Deactivate ${getUserDisplayName(dialog.user)}? This user will no longer be able to sign in.`,
    confirmLabel: dialog.type === 'delete' ? 'Archive' : dialog.type === 'activate' ? 'Activate' : 'Deactivate',
    confirmVariant: dialog.type === 'activate' ? 'success' : 'critical',
    onConfirm: confirm,
    onCancel: closeDialog,
  };

  return { openDialog, dialogProps };
}
