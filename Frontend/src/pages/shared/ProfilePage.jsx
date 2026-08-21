import { useState } from 'react';
import { MdPerson, MdEmail, MdBadge, MdEdit, MdCheck, MdClose } from 'react-icons/md';
import useAuth from '../../hooks/useAuth.js';
import useToast from '../../hooks/useToast.js';
import { roleLabels } from '../../utils/roles.js';

const AVATAR_COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#0EA5E9'];
const avatarColor = (str = '') => AVATAR_COLORS[(str.charCodeAt(0) || 0) % AVATAR_COLORS.length];

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
        <Icon size={18} className="text-[#2563EB]" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-[#0F172A]">{value || '—'}</p>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user, userRole } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.username || user?.email?.split('@')[0] || '');
  const [draft, setDraft] = useState(displayName);

  const initial = (user?.username?.[0] || user?.email?.[0] || '?').toUpperCase();
  const color = avatarColor(user?.username || user?.email || '');

  const saveEdit = () => {
    if (!draft.trim()) return;
    setDisplayName(draft.trim());
    setEditing(false);
    showToast({ type: 'success', message: 'Display name updated.' });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Avatar card */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-md"
          style={{ background: color }}
        >
          {initial}
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
              className="rounded-lg border border-[#CBD5E1] px-3 py-1.5 text-base font-semibold text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
            />
            <button type="button" onClick={saveEdit} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981] text-white hover:bg-[#059669]">
              <MdCheck size={16} />
            </button>
            <button type="button" onClick={() => setEditing(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]">
              <MdClose size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">{displayName}</h1>
            <button
              type="button"
              onClick={() => { setDraft(displayName); setEditing(true); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#2563EB]"
            >
              <MdEdit size={15} />
            </button>
          </div>
        )}

        <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB]">
          {roleLabels[userRole] || userRole}
        </span>
      </div>

      {/* Info fields */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#64748B]">Account Information</h2>
        <Field icon={MdPerson} label="Username" value={user?.username} />
        <Field icon={MdEmail} label="Email" value={user?.email} />
        <Field icon={MdBadge} label="Role" value={roleLabels[userRole] || userRole} />
        {user?.id && <Field icon={MdBadge} label="User ID" value={`#${user.id}`} />}
      </div>

      <p className="text-center text-xs text-[#94A3B8]">
        To change your email or password, contact your system administrator.
      </p>
    </div>
  );
}

export default ProfilePage;
