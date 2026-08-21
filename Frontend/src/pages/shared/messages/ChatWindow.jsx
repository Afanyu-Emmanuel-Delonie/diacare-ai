import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSend, MdMoreVert, MdArrowBack } from 'react-icons/md';
import EmptyState from '../../../components/common/EmptyState.jsx';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton.jsx';
import useAuth from '../../../hooks/useAuth.js';
import useToast from '../../../hooks/useToast.js';
import {
  buildMessagePayload,
  formatMessageDate,
  getMessagesByPatient,
  recipientOptionsFor,
  sendMessage,
} from '../../../services/messageService.js';
import { getApiErrorMessage } from '../../../utils/apiErrors.js';
import ChatMessageBubble from './ChatMessageBubble.jsx';

const AVATAR_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#0EA5E9'];
const avatarColor = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name = '') => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

function ChatWindow({ patientId, onReload }) {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const recipientOptions = useMemo(() => recipientOptionsFor(userRole), [userRole]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMessagesByPatient(patientId);
      setMessages((res.data || []).slice().reverse()); // oldest first
    } catch (e) {
      const msg = getApiErrorMessage(e, 'Failed to load messages.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const patientName = messages[messages.length - 1]?.patientName || `Patient #${patientId}`;
  const lastSeen = messages[messages.length - 1]?.sentAt;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(buildMessagePayload({
        patientId,
        subject: 'Message',
        content: text.trim(),
        recipientRole: recipientOptions[0] || 'DOCTOR',
      }));
      setText('');
      await load();
      onReload?.();
    } catch (err) {
      showToast({ type: 'error', message: getApiErrorMessage(err, 'Failed to send message.') });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] bg-[#F0F2F5] px-4 py-2.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: avatarColor(patientName) }}
        >
          {initials(patientName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-[#111B21]">{patientName}</p>
          {lastSeen && (
            <p className="text-xs text-[#667781]">Last message: {formatMessageDate(lastSeen)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate(`/dashboard/messages/new?patientId=${patientId}`)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#54656F] hover:bg-[#D9DBE1]"
          title="More options"
        >
          <MdMoreVert size={20} />
        </button>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto py-4 space-y-2"
        style={{ background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\"), #EBE5DC" }}
      >
        {loading && <div className="px-4"><LoadingSkeleton rows={4} /></div>}
        {!loading && error && <EmptyState title="Could not load messages" message={error} />}
        {!loading && !error && messages.length === 0 && (
          <EmptyState title="No messages yet" message="Send the first message below." />
        )}
        {!loading && !error && messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 border-t border-[#E2E8F0] bg-[#F0F2F5] px-4 py-3"
      >
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          placeholder="Type a message"
          className="flex-1 resize-none rounded-2xl border-0 bg-white px-4 py-2.5 text-sm text-[#111B21] outline-none placeholder:text-[#667781] focus:ring-0 max-h-32 overflow-y-auto"
          style={{ lineHeight: '1.5' }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-colors hover:bg-[#1ebe5d] disabled:opacity-40"
        >
          <MdSend size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
