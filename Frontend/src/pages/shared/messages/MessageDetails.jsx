import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../../components/common/Badge.jsx';
import Button from '../../../components/common/Button.jsx';
import Card from '../../../components/common/Card.jsx';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { canDeleteMessages, deleteMessage, formatMessageDate, getMessage, markMessageRead } from '../../../services/messageService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';

function MessageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canDelete = canDeleteMessages(userRole);

  const loadMessage = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMessage(id);
      setMessage(response.data);
    } catch (requestError) {
      const messageText = getApiErrorMessage(requestError, 'Failed to load message.');
      setError(messageText);
      showToast({ type: 'error', message: messageText });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessage();
  }, [id]);

  const markRead = async () => {
    try {
      await markMessageRead(id);
      showToast({ type: 'success', message: 'Message marked as read.' });
      await loadMessage();
    } catch (requestError) {
      const messageText = getApiErrorMessage(requestError, 'Failed to mark message as read.');
      showToast({ type: 'error', message: messageText });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(id);
      showToast({ type: 'success', message: 'Message deleted where backend allows.' });
      navigate('/dashboard/messages');
    } catch (requestError) {
      const messageText = getApiErrorMessage(requestError, 'Failed to delete message.');
      showToast({ type: 'error', message: messageText });
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} />;
  }

  if (!message) {
    return <EmptyState title="Message could not be loaded" message={error || 'Message was not found.'} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant={message.read ? 'success' : 'warning'}>{message.read ? 'READ' : 'UNREAD'}</Badge>
          <h1 className="mt-3 text-2xl font-bold text-[#334155]">{message.subject}</h1>
          <p className="mt-1 text-[#334155]/80">{message.patientName || `Patient #${message.patientId}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={message.read} onClick={markRead}>Mark read</Button>
          <Link to={`/dashboard/messages/new?patientId=${message.patientId}`}>
            <Button>Reply</Button>
          </Link>
          {canDelete && <Button variant="critical" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>}
        </div>
      </div>

      <Card>
        <dl className="grid gap-4 md:grid-cols-2">
          <Detail label="From" value={`${message.senderRole || 'USER'} - ${message.senderEmail || 'Unknown'}`} />
          <Detail label="To" value={message.recipientRole || 'Not specified'} />
          <Detail label="Receiver" value={message.receiver || message.recipientRole || 'Not specified'} />
          <Detail label="Date" value={message.date || 'Not set'} />
          <Detail label="Time" value={message.time || 'Not set'} />
          <Detail label="Sent" value={formatMessageDate(message.sentAt)} />
          <Detail label="Read At" value={formatMessageDate(message.readAt)} />
        </dl>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-[#334155]">Message</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#334155]/85">{message.content}</p>
        {message.attachmentUrl ? (
          <a className="mt-4 inline-block text-sm font-semibold text-[#2563EB] hover:underline" href={message.attachmentUrl} target="_blank" rel="noreferrer">
            View attachment
          </a>
        ) : (
          <p className="mt-4 text-sm text-[#334155]/75">No attachment available.</p>
        )}
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete message"
        message="Delete this message if the backend allows it? This does not change the related patient record."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
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

export default MessageDetails;
