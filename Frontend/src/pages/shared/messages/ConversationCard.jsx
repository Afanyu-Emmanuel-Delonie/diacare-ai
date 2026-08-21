import { MdDelete } from 'react-icons/md';
import { formatMessageDate } from '../../../services/messageService.js';

const ROLE_INITIALS = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

const AVATAR_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#0EA5E9'];
const avatarColor = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

function ConversationCard({ conversation, onOpen, onDelete, active }) {
  const hasUnread = conversation.unreadCount > 0;
  const color = avatarColor(conversation.patientName);

  return (
    <div
      onClick={() => onOpen(conversation)}
      className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F0F2F5] ${
        active ? 'bg-[#F0F2F5]' : 'bg-white'
      } border-b border-[#F0F2F5]`}
    >
      {/* Avatar */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ background: color }}
      >
        {ROLE_INITIALS(conversation.patientName)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-sm ${hasUnread ? 'font-bold text-[#111B21]' : 'font-medium text-[#111B21]'}`}>
            {conversation.patientName}
          </p>
          <span className={`shrink-0 text-[11px] ${hasUnread ? 'font-semibold text-[#25D366]' : 'text-[#667781]'}`}>
            {formatMessageDate(conversation.latestAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-xs ${hasUnread ? 'text-[#111B21]' : 'text-[#667781]'}`}>
            {conversation.latestMessage}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {hasUnread && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white">
                {conversation.unreadCount}
              </span>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(conversation); }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[#94A3B8] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                aria-label="Delete"
              >
                <MdDelete size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConversationCard;
