import { MdCheck, MdDoneAll } from 'react-icons/md';
import { formatMessageDate } from '../../../services/messageService.js';
import useAuth from '../../../hooks/useAuth.js';

const ROLE_COLORS = {
  DOCTOR:    '#2563EB',
  NURSE:     '#10B981',
  PATIENT:   '#8B5CF6',
  CAREGIVER: '#F59E0B',
};

function ChatMessageBubble({ message }) {
  const { userRole } = useAuth();
  const isSent = String(message.senderRole).toUpperCase() === String(userRole).toUpperCase();
  const roleColor = ROLE_COLORS[String(message.senderRole).toUpperCase()] || '#64748B';

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} px-4`}>
      <div className={`max-w-[72%] ${isSent ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {!isSent && (
          <span className="ml-1 text-[11px] font-semibold" style={{ color: roleColor }}>
            {message.senderRole} · {message.senderEmail}
          </span>
        )}
        <div
          className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
            isSent
              ? 'rounded-tr-sm bg-[#DCF8C6] text-[#1a1a1a]'
              : 'rounded-tl-sm bg-white text-[#1a1a1a]'
          }`}
        >
          {message.subject && message.subject !== 'No subject' && (
            <p className="mb-1 text-xs font-bold text-[#475569]">{message.subject}</p>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          {message.attachmentUrl && (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-block text-xs font-semibold text-[#2563EB] hover:underline"
            >
              📎 View attachment
            </a>
          )}
          <div className={`mt-1 flex items-center gap-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-[#94A3B8]">{formatMessageDate(message.sentAt)}</span>
            {isSent && (
              message.read
                ? <MdDoneAll size={13} className="text-[#2563EB]" />
                : <MdCheck size={13} className="text-[#94A3B8]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessageBubble;
