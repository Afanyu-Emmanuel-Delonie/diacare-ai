import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdSearch, MdAdd, MdMoreVert } from 'react-icons/md';
import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import {
  buildConversations,
  canDeleteMessages,
  deleteMessage,
  getMessages,
  getMessagesByPatient,
} from '../../../services/messageService.js';
import ConversationCard from './ConversationCard.jsx';
import ChatWindow from './ChatWindow.jsx';

function MessageList() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activePatientId, setActivePatientId] = useState(patientId || null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, conversation: null });

  const canDelete = canDeleteMessages(userRole);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = patientId ? await getMessagesByPatient(patientId) : await getMessages();
      setMessages(res.data || []);
    } catch (e) {
      const msg = getApiErrorMessage(e, 'Failed to load conversations.');
      setError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  const conversations = useMemo(() => buildConversations(messages), [messages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      c.patientName?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.latestMessage?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  // Auto-select first conversation
  useEffect(() => {
    if (!activePatientId && filtered.length > 0) {
      setActivePatientId(filtered[0].patientId);
    }
  }, [filtered]);

  const confirmDelete = async () => {
    if (!deleteDialog.conversation) return;
    try {
      await Promise.all(deleteDialog.conversation.messages.map((m) => deleteMessage(m.id)));
      showToast({ type: 'success', message: 'Conversation deleted.' });
      setDeleteDialog({ open: false, conversation: null });
      if (activePatientId === deleteDialog.conversation.patientId) setActivePatientId(null);
      await load();
    } catch (e) {
      showToast({ type: 'error', message: getApiErrorMessage(e, 'Unable to delete conversation.') });
      setDeleteDialog({ open: false, conversation: null });
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">

      {/* Left panel — conversation list */}
      <div className="flex w-[340px] shrink-0 flex-col border-r border-[#E2E8F0]">

        {/* Header */}
        <div className="flex items-center justify-between bg-[#F0F2F5] px-4 py-3">
          <span className="text-base font-bold text-[#111B21]">Messages</span>
          <button
            type="button"
            onClick={() => navigate(patientId ? `/dashboard/messages/new?patientId=${patientId}` : '/dashboard/messages/new')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#54656F] hover:bg-[#D9DBE1]"
            title="New conversation"
          >
            <MdAdd size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="bg-white px-3 py-2">
          <label className="flex items-center gap-2 rounded-full bg-[#F0F2F5] px-3 py-1.5">
            <MdSearch size={16} className="text-[#54656F]" />
            <input
              type="search"
              placeholder="Search or start new chat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#111B21] outline-none placeholder:text-[#667781]"
            />
          </label>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-4"><LoadingSkeleton rows={4} /></div>}
          {!loading && error && <EmptyState title="Could not load" message={error} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState title="No conversations" message="No conversations found." />
          )}
          {!loading && !error && filtered.map((c) => (
            <ConversationCard
              key={c.id}
              conversation={c}
              active={activePatientId === c.patientId}
              onOpen={(conv) => setActivePatientId(conv.patientId)}
              onDelete={canDelete ? (item) => setDeleteDialog({ open: true, conversation: item }) : null}
            />
          ))}
        </div>
      </div>

      {/* Right panel — chat */}
      <div className="flex flex-1 flex-col">
        {activePatientId ? (
          <ChatWindow
            patientId={activePatientId}
            onReload={load}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#F0F2F5]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DFE5E7]">
              <MdMoreVert size={36} className="text-[#54656F]" />
            </div>
            <p className="text-lg font-semibold text-[#41525D]">Select a conversation</p>
            <p className="text-sm text-[#667781]">Choose from your existing conversations or start a new one.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete conversation"
        message="Delete this conversation? This does not change the related patient record."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ open: false, conversation: null })}
      />
    </div>
  );
}

export default MessageList;
